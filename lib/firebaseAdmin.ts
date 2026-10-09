import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Lazy so `next build` doesn't need secrets. Server-side only.
export function adminDb() {
  const app =
    getApps()[0] ??
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)) });
  return getFirestore(app);
}
