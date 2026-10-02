import { adminDb } from "./firebaseAdmin";
import { quote } from "./pricing";

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

  // Block double-booking: paid stays, plus unpaid holds younger than 15 min.
  const recent = Date.now() - 15 * 60 * 1000;
  const snap = await adminDb().collection("bookings").where("checkIn", "<", input.checkOut).get();
  const clash = snap.docs.some((d) => {
    const b = d.data();
    return b.checkOut > input.checkIn && (b.paymentStatus === "paid" || (b.paymentStatus === "pending" && b.createdAtMs > recent));
  });
  if (clash) throw new Error("Sorry, those dates were just taken. Try different dates.");

  const ref = await adminDb().collection("bookings").add({
    ...input,
    nights: q.nights,
    totalAmount: q.total,
    depositAmount: q.deposit,
    commissionAmount: q.commission, // 2% of total, for your monthly statement
    paymentStatus: "pending",
    createdAtMs: Date.now(),
  });
  return { id: ref.id, deposit: q.deposit };
}

export async function markFailed(bookingId: string) {
  await adminDb().collection("bookings").doc(bookingId).update({ paymentStatus: "failed" });
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
      TransactionType: process.env.DARAJA_TRANSACTION_TYPE || "CustomerPayBillOnline", // till = CustomerBuyGoodsOnline
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
