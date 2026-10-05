import { adminDb } from "./firebaseAdmin";
import { Range, todayNairobi } from "./dates";
import { getImportedRanges } from "./ical";

const HOLD_MS = 15 * 60 * 1000; // unpaid bookings hold the dates for 15 minutes

// Dates blocked by THIS site: paid stays, fresh unpaid holds, and dates the owner blocked.
// This is also what we publish to Airbnb/Booking.com (never their own bookings echoed back).
export async function getOwnRanges(): Promise<Range[]> {
  const db = adminDb();
  const today = todayNairobi();
  const cutoff = Date.now() - HOLD_MS;

  const [bookings, blocks] = await Promise.all([
    db.collection("bookings").where("checkOut", ">", today).get(),
    db.collection("blocks").where("checkOut", ">", today).get(),
  ]);

  const out: Range[] = [];
  bookings.docs.forEach((d) => {
    const b = d.data();
    if (b.paymentStatus === "paid" || (b.paymentStatus === "pending" && b.createdAtMs > cutoff)) {
      out.push({ checkIn: b.checkIn, checkOut: b.checkOut });
    }
  });
  blocks.docs.forEach((d) => {
    const b = d.data();
    out.push({ checkIn: b.checkIn, checkOut: b.checkOut });
  });
  return out;
}

// Everything that can't be booked: our own dates PLUS bookings imported from other platforms.
export async function getUnavailableRanges(): Promise<Range[]> {
  const [own, imported] = await Promise.all([getOwnRanges(), getImportedRanges().catch(() => [] as Range[])]);
  return [...own, ...imported];
}
