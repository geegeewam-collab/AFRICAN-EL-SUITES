import { HostProfile } from "./types";

// ONE property, ONE site. To reuse this for the next client, edit this file,
// swap the images in /public/images, and set the env vars. Nothing else.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://serenitysuites.co.ke";

export const property: HostProfile = {
  id: "serenity-suites",
  slug: "serenity-suites",
  name: "Serenity Suites Nairobi",
  whatsappNumber: "254714324839",
  contactEmail: "africaelserenitysuites@gmail.com",
  instagramHandle: "africa_serenity_suites",
  address: {
    line1: "Sanasana Riviera Apartments",
    line2: "4th Floor, House 405",
    area: "South B, Nairobi",
  },
  geo: {
    latitude: -1.3192,
    longitude: 36.8328,
  },
  // Map: leave mapEmbedUrl out and the map is built from the address above.
  // For a pin on the exact building: Google Maps > Share > "Embed a map" > copy the src="..." link into mapEmbedUrl.
  nightlyRate: {
    weekday: 3500,
    weekend: 4000,
  },
  description: "A refined one-bedroom retreat designed for the discerning traveler.",
  heroTitle: "A private sanctuary of absolute stillness.",
  heroSubtext:
    "A curated retreat in South B, Nairobi — meticulously styled for the discerning traveler who seeks refuge in a fast-paced city.",
  heroImage: "/images/living-room-tv.jpg",
  // Real guest reviews only. While this list is empty the Reviews section stays hidden.
  // Add one after each happy stay, e.g.  { quote: "Spotless and so quiet.", name: "Jane W.", role: "Business traveller" }
  reviews: [],
  // House rules / cancellation terms.
  policies: [
    { title: "Check-in & check-out", text: "Check-in from 2:00 PM, check-out by 11:00 AM." },
    { title: "Cancellation Policy", text: "Full refund for cancellations made 48 hours before check-in. 50% refund within 48 hours." },
    { title: "House Rules", text: "Maximum 2 guests. No smoking inside the suite. Quiet hours from 10:00 PM." },
  ],
  gallery: [
    { src: "/images/bedroom-suite.jpg", alt: "Bedroom with tufted headboard and mirror", label: "Bedroom" },
    { src: "/images/living-room-lounge.jpg", alt: "Sofa and coffee table with fresh flowers", label: "Coffee Corner" },
    { src: "/images/kitchen-bar.jpg", alt: "Breakfast bar and kitchenette", label: "Breakfast Bar" },
    { src: "/images/styling-detail.jpg", alt: "Styling detail, fresh greenery", label: "Details" },
    { src: "/images/living-room-tv.jpg", alt: "Living room and TV lounge with cobalt curtains", label: "Living Room" },
    { src: "/images/living-room-main.jpg", alt: "Sofa corner beneath the cobalt curtains", label: "Lounge Corner" },
    { src: "/images/bedroom-detail.jpg", alt: "Bed detail with chevron accent pillow", label: "Bedroom Detail" },
    { src: "/images/kitchen-detail.jpg", alt: "Fitted kitchen cabinetry and cooktop", label: "Kitchenette" },
  ],
};

// Backward compatibility alias
export const host = property;