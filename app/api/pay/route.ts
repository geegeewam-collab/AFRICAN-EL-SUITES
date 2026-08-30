import { NextResponse } from "next/server";
import { createBooking, triggerStkPush } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hostId, guestName, guestPhone, checkIn, checkOut, guests, totalAmount, depositAmount } = body;

    if (!guestPhone || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the booking record in Firestore
    const booking = await createBooking({
      hostId,
      guestName,
      guestPhone,
      checkIn,
      checkOut,
      guests: Number(guests),
      totalAmount: Number(totalAmount),
      depositAmount: Number(depositAmount),
    });

    // 2. Trigger the STK Push (The actual money part)
    const paymentResult = await triggerStkPush(guestPhone, depositAmount, booking.id);

    if (!paymentResult.success) {
      return NextResponse.json({ error: "Payment trigger failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      transactionId: paymentResult.transactionId
    });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
