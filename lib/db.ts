import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { HostProfile } from "./types";

// Fallback host so the platform still works end-to-end before any
// Firestore data exists, and so local dev never crashes on missing keys.
const FALLBACK_HOST: HostProfile = {
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

export async function getHostBySlug(slug: string): Promise<HostProfile | null> {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn("Firebase config missing. Using fallback host.");
      return slug === FALLBACK_HOST.slug ? FALLBACK_HOST : null;
    }

    const hostsRef = collection(db, "hosts");
    const q = query(hostsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No host found in Firestore for slug "${slug}". Using fallback host if applicable.`);
      return slug === FALLBACK_HOST.slug ? FALLBACK_HOST : null;
    }

    const docData = querySnapshot.docs[0].data();
    return { id: querySnapshot.docs[0].id, ...docData } as HostProfile;
  } catch (error) {
    console.error("Error fetching host:", error);
    return slug === FALLBACK_HOST.slug ? FALLBACK_HOST : null;
  }
}

export async function getAllHosts(): Promise<HostProfile[]> {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return [FALLBACK_HOST];
    }
    const hostsRef = collection(db, "hosts");
    const querySnapshot = await getDocs(hostsRef);
    const hosts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HostProfile));
    return hosts.length > 0 ? hosts : [FALLBACK_HOST];
  } catch (error) {
    console.error("Error fetching all hosts:", error);
    return [FALLBACK_HOST];
  }
}
