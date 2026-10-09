import { property, SITE_URL } from "./property";
import { bookingRef } from "./ref";

export type BookingInfo = {
  bookingId: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  depositAmount: number;
  mpesaReceipt?: string | null;
};

const kes = (n: number) => `KES ${Number(n).toLocaleString("en-US")}`;
const day = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
// "12-14 Oct" when both dates are in the same month, otherwise "30 Oct-2 Nov" (keeps SMS short)
const span = (a: string, b: string) =>
  a.slice(0, 7) === b.slice(0, 7)
    ? `${Number(a.slice(8))}-${day(b)}`
    : `${day(a)}-${day(b)}`;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

// Plain ASCII on purpose: emojis turn an SMS into the expensive "unicode" kind.
export function guestSms(b: BookingInfo): string {
  return [
    `${property.name}: ${bookingRef(b.bookingId)} confirmed, ${span(b.checkIn, b.checkOut)} (${plural(b.nights, "night")}).`,
    `Deposit ${kes(b.depositAmount)} paid${b.mpesaReceipt ? ` (${b.mpesaReceipt})` : ""}.`,
    `Balance ${kes(b.totalAmount - b.depositAmount)} due on arrival.`,
    `WhatsApp +${property.whatsappNumber}`,
  ].join(" ");
}

export function ownerSms(b: BookingInfo): string {
  return [
    `New booking ${bookingRef(b.bookingId)}:`,
    `${b.guestName} +${b.guestPhone},`,
    `${span(b.checkIn, b.checkOut)} (${plural(b.nights, "night")}, ${plural(b.guests, "guest")}).`,
    `Total ${kes(b.totalAmount)}, deposit ${kes(b.depositAmount)} paid.`,
    `${SITE_URL}/admin`,
  ].join(" ");
}
