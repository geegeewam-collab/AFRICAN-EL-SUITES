import { Range, addDays, todayNairobi } from "./dates";

// ---------- parse (import from Airbnb / Booking.com) ----------
const unfold = (t: string) => t.replace(/\r?\n[ \t]/g, "");
const toIso = (v: string) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

export function parseIcsRanges(text: string): Range[] {
  const out: Range[] = [];
  const events = unfold(text).split(/BEGIN:VEVENT/i).slice(1);
  for (const ev of events) {
    const body = ev.split(/END:VEVENT/i)[0];
    let start = "";
    let end = "";
    let cancelled = false;
    for (const line of body.split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const name = line.slice(0, i).split(";")[0].toUpperCase();
      const value = line.slice(i + 1).trim();
      if (name === "DTSTART" && /^\d{8}/.test(value)) start = toIso(value);
      else if (name === "DTEND" && /^\d{8}/.test(value)) end = toIso(value);
      else if (name === "STATUS" && value.toUpperCase() === "CANCELLED") cancelled = true;
    }
    if (!start || cancelled) continue;
    if (!end || end <= start) end = addDays(start, 1);
    out.push({ checkIn: start, checkOut: end });
  }
  return out;
}

// ---------- build (export for Airbnb / Booking.com to read) ----------
export function dedupeRanges(ranges: Range[]): Range[] {
  const seen = new Set<string>();
  return ranges.filter((r) => {
    const k = `${r.checkIn}|${r.checkOut}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function buildIcs(ranges: Range[], calName: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Serenity Suites//Availability//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calName}`,
  ];
  for (const r of dedupeRanges(ranges)) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.checkIn}_${r.checkOut}@serenity-suites`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${r.checkIn.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${r.checkOut.replace(/-/g, "")}`,
      "SUMMARY:Reserved",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

// ---------- import with a 10 minute cache ----------
let cache: { at: number; ranges: Range[] } | null = null;
const TTL = 10 * 60 * 1000;

export const importUrls = () =>
  (process.env.ICAL_IMPORT_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter((u) => /^https:\/\//i.test(u));

export async function getImportedRanges(): Promise<Range[]> {
  const urls = importUrls();
  if (!urls.length) return [];
  if (cache && Date.now() - cache.at < TTL) return cache.ranges;

  const all: Range[] = [];
  let failed = 0;
  await Promise.all(
    urls.map(async (url) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        all.push(...parseIcsRanges(await res.text()));
      } catch (e) {
        failed++;
        console.error("[ical] import failed:", (e as Error)?.message);
      } finally {
        clearTimeout(timer);
      }
    })
  );

  // If every feed failed, keep serving the last good copy instead of "forgetting" the blocked dates.
  if (failed === urls.length && cache) return cache.ranges;

  const today = todayNairobi();
  const ranges = dedupeRanges(all.filter((r) => r.checkOut > today));
  cache = { at: failed === urls.length ? Date.now() - TTL + 60_000 : Date.now(), ranges }; // retry sooner after a total failure
  return ranges;
}

export const resetIcalCache = () => {
  cache = null;
};
