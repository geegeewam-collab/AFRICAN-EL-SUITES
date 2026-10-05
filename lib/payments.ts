import { adminDb } from "./firebaseAdmin";
import { quote } from "./pricing";
import { getUnavailableRanges } from "./availability";
import { rangeFree } from "./dates";
import { toE164 } from "./sms";

const BASE =
  process.env.DARAJA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

// An error that is safe to show to guests (anything else becomes a generic message).
export class BookingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Online payment is only switched on once ALL the Daraja settings exist. */
export const paymentsConfigured = () =>
  !!(
    process.env.DARAJA_CONSUMER_KEY &&
    process.env.DARAJA_CONSUMER_SECRET &&
    process.env.DARAJA_SHORTCODE &&
    process.env.DARAJA_PASSKEY &&
    process.env.DARAJA_CALLBACK_URL
  );

export function normalizePhone(raw: string) {
  const p = String(raw).replace(/[\s+-]/g, "");
  if (/^0[17]\d{8}$/.test(p)) return "254" + p.slice(1);
  if (/^254[17]\d{8}$/.test(p)) return p;
  return null;
}

export async function createBooking(input: {
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const q = quote(input.checkIn, input.checkOut);
  if (!q) throw new BookingError("Please choose valid dates.");

  // Anti-abuse: nobody can fire a stream of M-Pesa prompts at one phone number.
  const sameNumber = await adminDb().collection("bookings").where("guestPhone", "==", input.guestPhone).limit(30).get();
  const recent = sameNumber.docs.filter((d) => d.data().source !== "manual" && d.data().createdAtMs > Date.now() - 10 * 60 * 1000);
  if (recent.length >= 3) throw new BookingError("Too many attempts for this number. Please wait a few minutes and try again.", 429);

  // Block double-booking: paid stays, fresh unpaid holds, owner-blocked dates and other platforms.
  if (!rangeFree(input.checkIn, input.checkOut, await getUnavailableRanges())) {
    throw new BookingError("Sorry, those dates were just taken. Please choose different dates.", 409);
  }

  const now = Date.now();
  const ref = await adminDb().collection("bookings").add({
    ...input,
    source: "web",
    nights: q.nights,
    weekdayNights: q.weekdayNights,
    weekendNights: q.weekendNights,
    totalAmount: q.total,
    depositAmount: q.deposit,
    balanceAmount: q.balance,
    commissionAmount: q.commission,
    paymentStatus: "pending",
    bookingStatus: "pending",
    createdAtMs: now,
    updatedAtMs: now,
  });
  return { id: ref.id, deposit: q.deposit, totalAmount: q.total, balanceAmount: q.balance, weekdayNights: q.weekdayNights, weekendNights: q.weekendNights };
}

/** Owner adds a booking by hand (WhatsApp / cash / bank). Counts towards the monthly statement. */
export async function createManualBooking(input: {
  guestName: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const q = quote(input.checkIn, input.checkOut);
  if (!q) throw new BookingError("Choose valid dates in the future (check-out after check-in).");
  if (!rangeFree(input.checkIn, input.checkOut, await getUnavailableRanges())) {
    throw new BookingError("Those dates are already taken.", 409);
  }
  const phone = input.guestPhone ? normalizePhone(input.guestPhone) : "";
  if (input.guestPhone && !phone) throw new BookingError("That phone number doesn't look right (use 07xx or 2547xx).");

  const now = Date.now();
  const ref = await adminDb().collection("bookings").add({
    guestName: input.guestName,
    guestPhone: phone || "",
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    source: "manual",
    nights: q.nights,
    weekdayNights: q.weekdayNights,
    weekendNights: q.weekendNights,
    totalAmount: q.total,
    depositAmount: 0, // paid outside the site; nothing collected by M-Pesa here
    balanceAmount: q.total,
    commissionAmount: q.commission,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    createdAtMs: now,
    updatedAtMs: now,
    paidAtMs: now,
  });
  return ref.id;
}

export async function markFailed(bookingId: string, reason?: string | null) {
  await adminDb().collection("bookings").doc(bookingId).update({
    paymentStatus: "failed",
    bookingStatus: "failed",
    failReason: reason ?? null,
    updatedAtMs: Date.now(),
  });
}

export async function cancelBooking(bookingId: string) {
  await adminDb().collection("bookings").doc(bookingId).update({
    paymentStatus: "cancelled",
    bookingStatus: "cancelled",
    cancelledAtMs: Date.now(),
    updatedAtMs: Date.now(),
  });
}

async function getToken() {
  const auth = Buffer.from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) throw new BookingError("Payment service unavailable. Please try again in a moment.", 503);
  return (await res.json()).access_token as string;
}

export async function triggerStkPush(phone: string, amount: number, bookingId: string) {
  const token = await getToken();
  const shortcode = process.env.DARAJA_SHORTCODE as string;
  const timestamp = new Date(Date.now() + 3 * 3600000).toISOString().replace(/\D/g, "").slice(0, 14);
  const password = Buffer.from(shortcode + process.env.DARAJA_PASSKEY + timestamp).toString("base64");

  const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: process.env.DARAJA_TRANSACTION_TYPE || "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.DARAJA_PARTY_B || shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.DARAJA_CALLBACK_URL,
      AccountReference: "Booking",
      TransactionDesc: "Deposit",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.ResponseCode !== "0") {
    throw new BookingError("Could not start the M-Pesa prompt. Please check your number and try again.", 502);
  }

  await adminDb().collection("bookings").doc(bookingId).update({ checkoutRequestId: data.CheckoutRequestID });
}

export { toE164 };
