import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { adminDb } from "./firebaseAdmin";

export const COOKIE = "admin_session";
const WEEK_MS = 7 * 24 * 3600 * 1000;

const secret = () => process.env.ADMIN_SESSION_SECRET || "";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");
const safeEqual = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

export function makeToken() {
  const exp = String(Date.now() + WEEK_MS);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token?: string | null) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  return safeEqual(Buffer.from(sig), Buffer.from(sign(exp))) && Number(exp) > Date.now();
}

export function isAdmin() {
  return verifyToken(cookies().get(COOKIE)?.value);
}

/**
 * Passwords changed from the dashboard are stored in Firestore as
 *   scrypt$<salt>$<hash>      (current, slow hash)
 * Older "<salt>:<hash>" (HMAC) values are still accepted so nobody gets locked out.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("scrypt$")) {
    const [, salt, hash] = stored.split("$");
    if (!salt || !hash) return false;
    return safeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
  }
  const [salt, hash] = stored.split(":"); // legacy format
  if (!salt || !hash) return false;
  return safeEqual(Buffer.from(createHmac("sha256", salt).update(password).digest("hex")), Buffer.from(hash));
}

// null = no password saved in Firestore yet (use ADMIN_PASSWORD); "error" = couldn't read it.
async function readStoredHash(): Promise<string | null | "error"> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  try {
    const doc = await adminDb().collection("settings").doc("admin").get();
    const hash = doc.exists ? doc.data()?.passwordHash : null;
    return typeof hash === "string" && hash ? hash : null;
  } catch {
    return "error";
  }
}

function envPasswordOk(input: string) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real) return false;
  // Hash both sides so the comparison is constant-time and length-independent.
  const a = createHmac("sha256", "pw").update(input).digest();
  const b = createHmac("sha256", "pw").update(real).digest();
  return timingSafeEqual(a, b);
}

/**
 * ASYNC: callers MUST `await` this. Forgetting to makes every password "correct",
 * because a Promise is always truthy.
 */
export async function passwordOk(input: unknown): Promise<boolean> {
  if (typeof input !== "string" || input.length === 0) return false;
  const stored = await readStoredHash();
  if (stored === "error") return false; // can't verify, so deny rather than guess
  return stored ? verifyPassword(input, stored) : envPasswordOk(input);
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await adminDb().collection("settings").doc("admin").set({
    passwordHash: hashPassword(newPassword),
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
