import { NextResponse } from "next/server";
import { createBooking, markFailed, normalizePhone, triggerStkPush } from "@/lib/payments";

export async function POST(request: Request) {
  let bookingId: string | null = null;
  try {
    const { guestName, guestPhone, checkIn, checkOut, guests } = await request.json();
    const phone = normalizePhone(String(guestPhone ?? ""));

    if (!String(guestName ?? "").trim() || !phone) {
      return NextResponse.json({ error: "Enter your name and a valid Safaricom number." }, { status: 400 });
    }

    // Amounts are computed on the server from the dates. Never trust the client.
    const booking = await createBooking({
      guestName: String(guestName).trim(),
      guestPhone: phone,
      checkIn,
      checkOut,
      guests: Math.min(Math.max(Number(guests) || 1, 1), 2),
    });
    bookingId = booking.id;

    await triggerStkPush(phone, booking.deposit, booking.id);
    return NextResponse.json({ success: true, bookingId, deposit: booking.deposit });
  } catch (error: any) {
    if (bookingId) await markFailed(bookingId).catch(() => {});
    console.error("Pay API error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}