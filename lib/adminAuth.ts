import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { adminDb } from "./firebaseAdmin";

export const COOKIE = "admin_session";
const WEEK_MS = 7 * 24 * 3600 * 1000;

const secret = () => process.env.ADMIN_SESSION_SECRET || "";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

export function makeToken() {
  const exp = String(Date.now() + WEEK_MS);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token?: string | null) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b) && Number(exp) > Date.now();
}

export function isAdmin() {
  return verifyToken(cookies().get(COOKIE)?.value);
}

/**
 * Hash a password for storage. Uses PBKDF2-like approach with HMAC-SHA256.
 * Returns: `${salt}:${hash}` (both hex)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const computed = createHmac("sha256", salt).update(password).digest("hex");
  return timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

/**
 * Get the current admin password hash.
 * First checks Firestore (for runtime-updatable password), then falls back to env var.
 */
export async function getAdminPasswordHash(): Promise<string | null> {
  try {
    const doc = await adminDb().collection("settings").doc("admin").get();
    if (doc.exists && doc.data()?.passwordHash) {
      return doc.data()!.passwordHash as string;
    }
  } catch {
    // Firestore not available or no settings doc
  }
  // Fallback to env var (hashed at build time)
  const envPassword = process.env.ADMIN_PASSWORD || "";
  if (!envPassword) return null;
  // Hash the env password the same way for consistent comparison
  return hashPassword(envPassword);
}

/**
 * Check if the provided password matches the current admin password.
 */
export async function passwordOk(input: string): Promise<boolean> {
  const storedHash = await getAdminPasswordHash();
  if (!storedHash) return false;
  return verifyPassword(input, storedHash);
}

/**
 * Update the admin password in Firestore.
 */
export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = hashPassword(newPassword);
  await adminDb().collection("settings").doc("admin").set({
    passwordHash: hash,
    updatedAtMs: Date.now(),
  });
}

export const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WEEK_MS / 1000,
};