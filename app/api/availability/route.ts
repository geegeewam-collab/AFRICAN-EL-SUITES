import { NextResponse } from "next/server";
import { getUnavailableRanges } from "@/lib/availability";

export const dynamic = "force-dynamic";

// Public: returns ONLY date ranges, never guest details.
export async function GET() {
  try {
    return NextResponse.json({ ranges: await getUnavailableRanges() });
  } catch (e) {
    console.error("availability error", e);
    // Fail open for display; the pay route re-checks on the server anyway.
    return NextResponse.json({ ranges: [] });
  }
}
