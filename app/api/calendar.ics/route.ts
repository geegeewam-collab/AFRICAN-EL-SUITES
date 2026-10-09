import { timingSafeEqual } from "crypto";
import { getOwnRanges } from "@/lib/availability";
import { buildIcs } from "@/lib/ical";
import { property } from "@/lib/property";

export const dynamic = "force-dynamic";

// Paste this link (with its token) into Airbnb / Booking.com "Import calendar" so they block the
// nights guests book here. It only ever contains dates, labelled "Reserved".
export async function GET(req: Request) {
  const expected = process.env.ICAL_EXPORT_TOKEN || "";
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) return new Response("Not found", { status: 404 });

  try {
    return new Response(buildIcs(await getOwnRanges(), property.name), {
      headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Calendar unavailable", { status: 503 });
  }
}
