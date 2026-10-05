import { property, SITE_URL } from "./property";
import { bookingRef } from "./ref";

const kes = (n: number) => `KES ${Number(n).toLocaleString("en-US")}`;

export interface BookingConfirmationData {
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  depositAmount: number;
}

export interface BookingInquiryData {
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName?: string;
  guestPhone?: string;
}

/**
 * Generate a WhatsApp message for booking confirmation after successful payment.
 * This is sent to the guest.
 */
export function generateBookingConfirmationWhatsApp(data: BookingConfirmationData): string {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
  };

  const balance = data.totalAmount - data.depositAmount;
  const shortRef = bookingRef(data.bookingId);

  return [
    `✅ Your booking at ${property.name} is confirmed.`,
    "",
    `Booking: ${shortRef}`,
    `Check-in: ${formatDate(data.checkIn)}`,
    `Check-out: ${formatDate(data.checkOut)}`,
    `Guests: ${data.guests}`,
    `Amount paid: ${kes(data.depositAmount)}`,
    `Balance on arrival: ${kes(balance)}`,
    "",
    `We look forward to hosting you!`,
    "",
    `📍 ${property.address.line1}, ${property.address.area}`,
    `📱 WhatsApp: https://wa.me/${property.whatsappNumber}`,
  ].join("\n");
}

/**
 * Generate a WhatsApp message for a booking inquiry (before payment).
 * This is sent from the guest to the host.
 */
export function generateBookingInquiryWhatsApp(data: BookingInquiryData): string {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
  };

  const dates = data.checkIn && data.checkOut
    ? `${formatDate(data.checkIn)} to ${formatDate(data.checkOut)}`
    : data.checkIn
      ? `checking in ${formatDate(data.checkIn)}`
      : "dates I'll confirm";

  const parts = [
    `Hi! I'm interested in a stay at ${property.name}.`,
    "",
    `📅 Request: ${dates}`,
    `👥 Guests: ${data.guests}`,
  ];

  if (data.guestName) parts.push(`👤 Name: ${data.guestName}`);
  if (data.guestPhone) parts.push(`📱 Phone: ${data.guestPhone}`);

  parts.push("", "Could you please check availability for these dates?");

  return parts.join("\n");
}

/**
 * Generate a WhatsApp URL for opening the chat with a pre-filled message.
 */
export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${property.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp URL for booking confirmation (guest side).
 */
export function getBookingConfirmationWhatsAppUrl(data: BookingConfirmationData): string {
  return getWhatsAppUrl(generateBookingConfirmationWhatsApp(data));
}

/**
 * Generate a WhatsApp URL for booking inquiry (guest to host).
 */
export function getBookingInquiryWhatsAppUrl(data: BookingInquiryData): string {
  return getWhatsAppUrl(generateBookingInquiryWhatsApp(data));
}

/**
 * Generate a WhatsApp message for owner notification.
 * This is sent to the property owner.
 */
export function generateOwnerNotificationWhatsApp(data: BookingConfirmationData & { guestPhone: string }): string {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  };

  const balance = data.totalAmount - data.depositAmount;
  const shortRef = bookingRef(data.bookingId);

  return [
    `🎉 New booking confirmed at ${property.name}`,
    "",
    `Booking: ${shortRef}`,
    `Guest: ${data.guestName}`,
    `Phone: +${data.guestPhone}`,
    `Stay: ${formatDate(data.checkIn)} to ${formatDate(data.checkOut)} (${data.guests} guest${data.guests > 1 ? "s" : ""})`,
    `Total: ${kes(data.totalAmount)}`,
    `Deposit paid: ${kes(data.depositAmount)}`,
    `Balance due: ${kes(balance)}`,
    "",
    `💬 Message guest: https://wa.me/${data.guestPhone}`,
    `📊 Dashboard: ${SITE_URL}/admin`,
  ].join("\n");
}