import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { parse } from "@/lib/dates";
import { BookingError, cancelBooking, createManualBooking } from "@/lib/payments";
import { finalizePaid, resendGuestSms } from "@/lib/confirm";

const ID = /^[A-Za-z0-9]{8,40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  if (!isAdmin()) return fail("Not signed in.", 401);

  // Same-site JSON only (blocks cross-site form posts).
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return fail("Bad origin.", 403);
  if (!req.headers.get("content-type")?.includes("application/json")) return fail("Bad request.");

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Bad request.");
  try {
    return await run(body as Record<string, unknown>);
  } catch (e) {
    if (e instanceof BookingError) return fail(e.message, e.status);
    console.error("admin action failed", e);
    return fail("Could not save. Please try again.", 500);
  }
}

async function run(body: Record<string, unknown>) {
  const id = str(body.id, 40);
  switch (body.action) {
    case "cancel": {
      if (!ID.test(id)) return fail("Bad id.");
      await cancelBooking(id);
      return NextResponse.json({ ok: true });
    }
    case "markPaid": {
      if (!ID.test(id)) return fail("Bad id.");
      const status = await finalizePaid(id, str(body.receipt, 30) || null);
      if (status === "missing") return fail("Booking not found.", 404);
      return NextResponse.json({ ok: true, alreadyPaid: status === "already" });
    }
    case "resendSms": {
      if (!ID.test(id)) return fail("Bad id.");
      const r = await resendGuestSms(id);
      return r.ok ? NextResponse.json({ ok: true }) : fail(r.detail || "SMS failed.", 400);
    }
    case "addBooking": {
      const guestName = str(body.guestName, 80);
      const checkIn = str(body.checkIn, 10);
      const checkOut = str(body.checkOut, 10);
      if (!guestName) return fail("Enter the guest's name.");
      if (!DATE.test(checkIn) || !DATE.test(checkOut)) return fail("Choose check-in and check-out dates.");
      await createManualBooking({
        guestName,
        guestPhone: str(body.guestPhone, 20),
        checkIn,
        checkOut,
        guests: Math.min(Math.max(Number(body.guests) || 1, 1), 2),
      });
      return NextResponse.json({ ok: true });
    }
    case "addBlock": {
      const checkIn = str(body.checkIn, 10);
      const checkOut = str(body.checkOut, 10);
      if (!DATE.test(checkIn) || !DATE.test(checkOut) || checkOut <= checkIn) return fail("Choose valid dates (check-out after check-in).");
      if ((parse(checkOut) - parse(checkIn)) / 86400000 > 365) return fail("Range too long.");
      await adminDb().collection("blocks").add({ checkIn, checkOut, note: str(body.note, 80), createdAtMs: Date.now() });
      return NextResponse.json({ ok: true });
    }
    case "removeBlock": {
      if (!ID.test(id)) return fail("Bad id.");
      await adminDb().collection("blocks").doc(id).delete();
      return NextResponse.json({ ok: true });
    }
    default:
      return fail("Unknown action.");
  }
}
