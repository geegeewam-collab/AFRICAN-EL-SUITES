import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// Safaricom calls this after the guest enters (or cancels) their PIN.
// Set DARAJA_CALLBACK_URL = https://YOURDOMAIN/api/mpesa/callback?token=<DARAJA_CALLBACK_SECRET>
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!process.env.DARAJA_CALLBACK_SECRET || token !== process.env.DARAJA_CALLBACK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cb = (await req.json())?.Body?.stkCallback;
  if (cb?.CheckoutRequestID) {
    const snap = await adminDb().collection("bookings").where("checkoutRequestId", "==", cb.CheckoutRequestID).limit(1).get();
    if (!snap.empty) {
      const items: { Name: string; Value?: string | number }[] = cb.CallbackMetadata?.Item ?? [];
      const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value ?? null;
      await snap.docs[0].ref.update(
        cb.ResultCode === 0
          ? { paymentStatus: "paid", mpesaReceipt: receipt, paidAtMs: Date.now() }
          : { paymentStatus: "failed", failReason: cb.ResultDesc ?? null }
      );
    }
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
