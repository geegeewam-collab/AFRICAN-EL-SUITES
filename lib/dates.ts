// Date helpers shared by the calendar (browser) and the server.
// All dates are "YYYY-MM-DD" strings, handled in UTC so time zones never shift them.
const DAY = 86400000;

export type Range = { checkIn: string; checkOut: string };

export const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (s: string, n: number) => fmt(parse(s) + n * DAY);
export const todayNairobi = () => new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);

// A booking 12 -> 14 occupies the NIGHTS of the 12th and 13th. Check-out day itself is free.
export const isTaken = (night: string, ranges: Range[]) =>
  ranges.some((r) => r.checkIn <= night && night < r.checkOut);

export const rangeFree = (checkIn: string, checkOut: string, ranges: Range[]) =>
  !ranges.some((r) => r.checkIn < checkOut && r.checkOut > checkIn);
