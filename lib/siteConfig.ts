export const WHATSAPP_NUMBER = "254714324839"; // ← REPLACE with the real line, digits only, country code first
export const CONTACT_EMAIL = "africaelserenitysuites@gmail.com"; // ← REPLACE if different
export const INSTAGRAM_HANDLE = "africa_serenity_suites"; // ← add without @ once the account exists, e.g. "serenitysuitesnairobi"

export const ADDRESS = {
  line1: "Sanasana Riviera Apartments",
  line2: "4th Floor, House 405",
  area: "South B, Nairobi",
};

export const NIGHTLY_RATE = {
  weekday: 3500,
  weekend: 4000,
};

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
