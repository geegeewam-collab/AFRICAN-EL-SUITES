import nodemailer from "nodemailer";
import { property, SITE_URL } from "./property";
import { bookingRef } from "./ref";

type Alert = {
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

export const emailConfigured = () => !!(process.env.ALERT_EMAIL_USER && process.env.ALERT_EMAIL_APP_PASSWORD);

// Free email alert to the owner via Gmail (use an App Password, not the real password).
export async function sendBookingAlert(b: Alert) {
  const user = process.env.ALERT_EMAIL_USER;
  const pass = process.env.ALERT_EMAIL_APP_PASSWORD;
  const to = process.env.ALERT_EMAIL_TO || user;
  if (!user || !pass || !to) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 8000,
    socketTimeout: 8000,
  });

  const ref = bookingRef(b.bookingId);
  const text = [
    `New paid booking ${ref} at ${property.name}`,
    "",
    `Guest: ${b.guestName}`,
    `Phone: +${b.guestPhone}`,
    `Stay: ${b.checkIn} to ${b.checkOut} (${b.nights} night${b.nights > 1 ? "s" : ""}, ${b.guests} guest${b.guests > 1 ? "s" : ""})`,
    `Total: ${kes(b.totalAmount)}`,
    `Deposit paid: ${kes(b.depositAmount)}`,
    `Balance on arrival: ${kes(b.totalAmount - b.depositAmount)}`,
    b.mpesaReceipt ? `M-Pesa receipt: ${b.mpesaReceipt}` : "",
    "",
    `Message the guest on WhatsApp: https://wa.me/${b.guestPhone}`,
    `Open your dashboard: ${SITE_URL}/admin`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  await transporter.sendMail({
    from: `"${property.name}" <${user}>`,
    to,
    subject: `New booking ${ref}: ${b.guestName}, ${b.checkIn} to ${b.checkOut}`,
    text,
  });
}
