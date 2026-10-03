import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { markPaid, markFailed } from "@/lib/payments";
import { sendBookingAlert } from "@/lib/notify";
import { generateBookingConfirmationWhatsApp } from "@/lib/whatsapp";

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
    const doc = snap.docs[0];
    // Safaricom can retry a callback; ignore it if we've already marked this one paid.
    if (doc && doc.data().paymentStatus !== "paid") {
      if (cb.ResultCode === 0) {
        const items: { Name: string; Value?: string | number }[] = cb.CallbackMetadata?.Item ?? [];
        const receipt = (items.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string | undefined) ?? null;
        await markPaid(doc.id, receipt);

        try {
          const b = doc.data();
          await sendBookingAlert({
            guestName: b.guestName,
            guestPhone: b.guestPhone,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            nights: b.nights,
            guests: b.guests,
            totalAmount: b.totalAmount,
            depositAmount: b.depositAmount,
            mpesaReceipt: receipt,
          });

          // Also send WhatsApp confirmation to guest
          const waMessage = generateBookingConfirmationWhatsApp({
            bookingId: doc.id,
            guestName: b.guestName,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            guests: b.guests,
            totalAmount: b.totalAmount,
            depositAmount: b.depositAmount,
          });

          console.log("Booking confirmed. WhatsApp message for guest:", waMessage);
        } catch (e) {
          console.error("Booking alert failed (booking is still saved):", e);
        }
      } else {
        await markFailed(doc.id);
      }
    }
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}