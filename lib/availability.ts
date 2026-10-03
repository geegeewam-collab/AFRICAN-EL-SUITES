import { adminDb } from "./firebaseAdmin";
import { Range, todayNairobi } from "./dates";
import { Booking, Block } from "./types";

const HOLD_MS = 15 * 60 * 1000; // unpaid bookings hold the dates for 15 minutes

// Every date range that can't be booked: paid stays, fresh unpaid holds, and
// dates the owner blocked (Airbnb bookings, personal use, maintenance).
export async function getUnavailableRanges(): Promise<Range[]> {
  const db = adminDb();
  const today = todayNairobi();
  const cutoff = Date.now() - HOLD_MS;

  const [bookings, blocks] = await Promise.all([
    db.collection("bookings").where("checkOut", ">", today).get(),
    db.collection("blocks").where("checkOut", ">", today).get(),
  ]);

  const out: Range[] = [];
  bookings.docs.forEach((d) => {
    const b = d.data() as Booking;
    if (b.paymentStatus === "paid" || (b.paymentStatus === "pending" && b.createdAtMs > cutoff)) {
      out.push({ checkIn: b.checkIn, checkOut: b.checkOut });
    }
  });
  blocks.docs.forEach((d) => {
    const b = d.data() as Block;
    out.push({ checkIn: b.checkIn, checkOut: b.checkOut });
  });
  return out;
}
