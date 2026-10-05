import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { bookingRef } from "@/lib/ref";

export const dynamic = "force-dynamic";

// The booking page polls this after the M-Pesa prompt, so guests see "Confirmed" the moment they pay.
// Returns only status + amounts (no names or phone numbers). The id is Firestore's unguessable random id.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9]{8,40}$/.test(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  try {
    const snap = await adminDb().collection("bookings").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const b = snap.data()!;
    return NextResponse.json(
      {
        status: b.paymentStatus,
        ref: bookingRef(id),
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        depositAmount: b.depositAmount,
        balanceAmount: b.balanceAmount,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
