import { property } from "./property";

export const DEPOSIT_RATE = 0.5; // guest pays 50% to lock the dates
export const COMMISSION_RATE = 0.02; // your cut, logged on every booking

const DAY = 86400000;
const toUTC = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
};

// Single source of truth for money. Used by the form (display) AND the
// server (authoritative), so a guest can never tamper with the amount.
export function quote(checkIn: string, checkOut: string) {
  const ok = /^\d{4}-\d{2}-\d{2}$/;
  if (!ok.test(checkIn) || !ok.test(checkOut)) return null;
  const today = new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10); // Nairobi
  if (checkIn < today) return null;
  const start = toUTC(checkIn);
  const nights = Math.round((toUTC(checkOut) - start) / DAY);
  if (nights < 1 || nights > 30) return null;

  let total = 0;
  for (let i = 0; i < nights; i++) {
    const dow = new Date(start + i * DAY).getUTCDay(); // Fri & Sat nights = weekend rate
    total += dow === 5 || dow === 6 ? property.nightlyRate.weekend : property.nightlyRate.weekday;
  }
  return {
    nights,
    total,
    deposit: Math.round(total * DEPOSIT_RATE),
    commission: Math.round(total * COMMISSION_RATE),
  };
}
