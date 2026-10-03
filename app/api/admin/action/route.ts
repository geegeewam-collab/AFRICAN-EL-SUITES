import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { parse } from "@/lib/dates";
import { markPaid, cancelBooking } from "@/lib/payments";

const ID = /^[A-Za-z0-9]{8,40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  if (!isAdmin()) return fail("Not signed in.", 401);

  // Same-site JSON only (blocks cross-site form posts).
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return fail("Bad origin.", 403);
  if (!req.headers.get("content-type")?.includes("application/json")) return fail("Bad request.");

  const body = await req.json().catch(() => null);
  if (!body) return fail("Bad request.");
  try {
    return await run(body);
  } catch (e) {
    console.error("admin action failed", e);
    return fail("Could not save. Please try again.", 500);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run(body: any) {
  switch (body.action) {
    case "cancel": {
      if (!ID.test(body.id)) return fail("Bad id.");
      await cancelBooking(body.id);
      return NextResponse.json({ ok: true });
    }
    case "markPaid": {
      if (!ID.test(body.id)) return fail("Bad id.");
      const receipt = String(body.receipt ?? "").trim().slice(0, 30) || null;
      await markPaid(body.id, receipt);
      return NextResponse.json({ ok: true });
    }
    case "addBlock": {
      const { checkIn, checkOut } = body;
      if (!DATE.test(checkIn) || !DATE.test(checkOut) || checkOut <= checkIn) return fail("Choose valid dates (check-out after check-in).");
      if ((parse(checkOut) - parse(checkIn)) / 86400000 > 365) return fail("Range too long.");
      await adminDb().collection("blocks").add({
        checkIn,
        checkOut,
        note: String(body.note ?? "").trim().slice(0, 80),
        createdAtMs: Date.now(),
      });
      return NextResponse.json({ ok: true });
    }
    case "removeBlock": {
      if (!ID.test(body.id)) return fail("Bad id.");
      await adminDb().collection("blocks").doc(body.id).delete();
      return NextResponse.json({ ok: true });
    }
    default:
      return fail("Unknown action.");
  }
}