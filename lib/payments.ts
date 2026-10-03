import { adminDb } from "./firebaseAdmin";
import { quote } from "./pricing";
import { getUnavailableRanges } from "./availability";
import { rangeFree } from "./dates";

const BASE =
  process.env.DARAJA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

export function normalizePhone(raw: string) {
  const p = raw.replace(/[\s+-]/g, "");
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
  if (!q) throw new Error("Please choose valid dates.");

  // Block double-booking: paid stays, fresh unpaid holds, and owner-blocked dates.
  if (!rangeFree(input.checkIn, input.checkOut, await getUnavailableRanges())) {
    throw new Error("Sorry, those dates were just taken. Try different dates.");
  }

  const ref = await adminDb().collection("bookings").add({
    ...input,
    nights: q.nights,
    weekdayNights: q.weekdayNights,
    weekendNights: q.weekendNights,
    totalAmount: q.total,
    depositAmount: q.deposit,
    balanceAmount: q.balance,
    commissionAmount: q.commission,
    paymentStatus: "pending",
    bookingStatus: "pending",
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
  });
  return {
    id: ref.id,
    deposit: q.deposit,
    totalAmount: q.total,
    balanceAmount: q.balance,
    weekdayNights: q.weekdayNights,
    weekendNights: q.weekendNights,
  };
}

export async function markFailed(bookingId: string) {
  await adminDb().collection("bookings").doc(bookingId).update({
    paymentStatus: "failed",
    bookingStatus: "failed",
    updatedAtMs: Date.now(),
  });
}

export async function markPaid(bookingId: string, receipt: string | null) {
  await adminDb().collection("bookings").doc(bookingId).update({
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    mpesaReceipt: receipt,
    paidAtMs: Date.now(),
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
  if (!res.ok) throw new Error("Payment service unavailable. Please try again.");
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
  const data = await res.json();
  if (data.ResponseCode !== "0") throw new Error("Could not start the M-Pesa prompt. Check your number and try again.");

  await adminDb().collection("bookings").doc(bookingId).update({ checkoutRequestId: data.CheckoutRequestID });
}