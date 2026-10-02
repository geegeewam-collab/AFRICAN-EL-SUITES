import { HostProfile } from "./types";

// ONE property, ONE site. To reuse this for the next client, edit this file,
// swap the images in /public/images, and set the env vars. Nothing else.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://africaelsuites.com";

export const property: HostProfile = {
  id: "host_1",
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
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8189263636!2d36.82081!3d-1.31920!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f11a81dacbf35%3A0x4f8e6e4e4e4e4e4e!2sSouth%20B%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske",
  nightlyRate: {
    weekday: 3500,
    weekend: 4000,
  },
  description: "A refined one-bedroom retreat designed for the discerning traveler.",
  heroTitle: "A private sanctuary of absolute stillness.",
  heroSubtext:
    "A curated retreat ten minutes from JKIA — meticulously styled for the discerning traveler who seeks refuge in a fast-paced city.",
  heroImage: "/images/living-room-tv.jpg",
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
