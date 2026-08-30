import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { HostProfile } from "./types";

// We keep a fallback for development so the site doesn't crash if keys are missing
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
  nightlyRate: {
    weekday: 3500,
    weekend: 4000,
  },
  description: "A refined one-bedroom retreat designed for the discerning traveler.",
  heroTitle: "A private sanctuary of absolute stillness.",
  heroSubtext: "A curated retreat ten minutes from JKIA — meticulously styled for the discerning traveler who seeks refuge in a fast-paced city.",
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
      return null;
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HostProfile));
  } catch (error) {
    console.error("Error fetching all hosts:", error);
    return [FALLBACK_HOST];
  }
}
