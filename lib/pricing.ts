// Nightly rates come from lib/property.ts so the price shown and the price charged can never differ.
import { property } from "./property";

export const PRICING_CONFIG = {
  weekdayRate: property.nightlyRate.weekday,
  weekendRate: property.nightlyRate.weekend,
  depositRate: 0.5,      // 50% deposit to lock dates
  commissionRate: 0.015, // your cut, logged on every booking
  maxNights: 30,
  maxGuests: 2,
} as const;

export const DEPOSIT_RATE = PRICING_CONFIG.depositRate;
export const COMMISSION_RATE = PRICING_CONFIG.commissionRate;

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
  if (nights < 1 || nights > PRICING_CONFIG.maxNights) return null;

  let weekdayNights = 0;
  let weekendNights = 0;
  let total = 0;

  for (let i = 0; i < nights; i++) {
    const dow = new Date(start + i * DAY).getUTCDay(); // Fri & Sat nights = weekend rate
    if (dow === 5 || dow === 6) {
      weekendNights++;
      total += PRICING_CONFIG.weekendRate;
    } else {
      weekdayNights++;
      total += PRICING_CONFIG.weekdayRate;
    }
  }

  return {
    nights,
    weekdayNights,
    weekendNights,
    total,
    deposit: Math.round(total * DEPOSIT_RATE),
    commission: Math.round(total * COMMISSION_RATE),
    balance: Math.round(total * (1 - DEPOSIT_RATE)),
  };
}