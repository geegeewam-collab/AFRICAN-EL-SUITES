import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { markFailed } from "@/lib/payments";
import { finalizePaid } from "@/lib/confirm";

// Safaricom calls this after the guest enters (or cancels) their PIN.
// Set DARAJA_CALLBACK_URL = https://YOURDOMAIN/api/mpesa/callback?token=<DARAJA_CALLBACK_SECRET>
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!process.env.DARAJA_CALLBACK_SECRET || token !== process.env.DARAJA_CALLBACK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cb = (await req.json().catch(() => null))?.Body?.stkCallback;
  if (cb?.CheckoutRequestID) {
    const snap = await adminDb().collection("bookings").where("checkoutRequestId", "==", cb.CheckoutRequestID).limit(1).get();
    const doc = snap.docs[0];
    if (doc) {
      if (cb.ResultCode === 0) {
        const items: { Name: string; Value?: string | number }[] = cb.CallbackMetadata?.Item ?? [];
        const receipt = (items.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string | undefined) ?? null;
        // Idempotent: a retried callback finds it already paid and does nothing (no duplicate SMS).
        await finalizePaid(doc.id, receipt);
      } else if (doc.data().paymentStatus === "pending") {
        await markFailed(doc.id, cb.ResultDesc ?? null);
      }
    }
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
