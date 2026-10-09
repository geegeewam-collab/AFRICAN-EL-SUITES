import { NextResponse } from "next/server";
import { BookingError, createBooking, markFailed, normalizePhone, paymentsConfigured, triggerStkPush } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Best-effort per-IP limit, deliberately generous: mobile networks in Kenya put many phones behind ONE shared IP,
// so a strict cap would block real guests. The strict protection is the per-phone limit in createBooking.
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) hits.clear();
  return list.length > 30;
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  if (!paymentsConfigured()) {
    return fail("Online payment isn't switched on yet. Please send us a booking request on WhatsApp instead.", 503);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return fail("Too many attempts. Please wait a few minutes and try again.", 429);

  let bookingId: string | null = null;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return fail("Bad request.", 400);
    const { guestName, guestPhone, checkIn, checkOut, guests } = body as Record<string, unknown>;

    const name = typeof guestName === "string" ? guestName.trim().slice(0, 80) : "";
    const phone = typeof guestPhone === "string" ? normalizePhone(guestPhone) : null;
    if (!name || !phone) return fail("Enter your name and a valid Safaricom number.", 400);
    if (typeof checkIn !== "string" || typeof checkOut !== "string") return fail("Please choose your dates.", 400);

    // Amounts are computed on the server from the dates. Never trust the client.
    const booking = await createBooking({
      guestName: name,
      guestPhone: phone,
      checkIn,
      checkOut,
      guests: Math.min(Math.max(Number(guests) || 1, 1), 2),
    });
    bookingId = booking.id;

    await triggerStkPush(phone, booking.deposit, booking.id);
    return NextResponse.json({ success: true, bookingId, deposit: booking.deposit });
  } catch (error) {
    if (bookingId) await markFailed(bookingId, "Could not start M-Pesa prompt").catch(() => {});
    if (error instanceof BookingError) return fail(error.message, error.status);
    console.error("Pay API error:", error);
    return fail("Something went wrong on our side. Please try again, or message us on WhatsApp.", 500);
  }
}
