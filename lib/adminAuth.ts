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
  } catch (e) {
    // This is the usual reason a correct password gets rejected: bad/missing FIREBASE_SERVICE_ACCOUNT,
    // or the Firestore database was never created. Read the message in Vercel > Logs.
    console.error("[admin] Could not read the saved password from Firestore:", e instanceof Error ? e.message : e);
    return "error";
  }
}

/**
 * The password(s) the ADMIN_PASSWORD variable can mean. Vercel keeps stray spaces/newlines from copy-paste,
 * and people sometimes type the value inside quotes, so we accept the value trimmed, with or without quotes.
 * There is deliberately NO hardcoded fallback: a password written in the source code is a password
 * everyone who can read the repository knows.
 */
function envPasswords(): string[] {
  const raw = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!raw) return [];
  const unquoted = /^(["']).*\1$/.test(raw) && raw.length > 2 ? raw.slice(1, -1) : raw;
  return Array.from(new Set([raw, unquoted]));
}

function sameSecret(a: string, b: string) {
  // Hash both sides so the comparison is constant-time and length-independent.
  const x = createHmac("sha256", "pw").update(a).digest();
  const y = createHmac("sha256", "pw").update(b).digest();
  return timingSafeEqual(x, y);
}

export type PasswordCheck = "ok" | "wrong" | "not-configured" | "db-error";

/**
 * ASYNC: callers MUST `await` this.
 *  ok              password is right
 *  wrong           password is wrong
 *  not-configured  no password exists anywhere (ADMIN_PASSWORD missing and nothing saved in Firestore)
 *  db-error        FIREBASE_SERVICE_ACCOUNT is set but Firestore can't be read, so we can't verify (deny)
 */
export async function checkPassword(input: unknown): Promise<PasswordCheck> {
  if (typeof input !== "string" || input.length === 0) return "wrong";

  const stored = await readStoredHash();
  if (stored === "error") return "db-error";

  if (stored) {
    const ok = verifyPassword(input, stored);
    if (!ok) console.warn("[admin] Wrong password. Checked against the password saved in Firestore (ADMIN_PASSWORD is ignored while one is saved).");
    return ok ? "ok" : "wrong";
  }

  const real = envPasswords();
  if (real.length === 0) {
    console.error("[admin] ADMIN_PASSWORD is not set in this deployment (and no password is saved in Firestore). Add it in Vercel and redeploy.");
    return "not-configured";
  }
  // also accept the typed value without stray leading/trailing spaces (phone keyboards add them)
  const candidates = Array.from(new Set([input, input.trim()]));
  const ok = candidates.some((c) => real.some((r) => sameSecret(c, r)));
  if (!ok) console.warn("[admin] Wrong password. Checked against ADMIN_PASSWORD.");
  return ok ? "ok" : "wrong";
}

/** Boolean wrapper (used when the owner changes the password from the dashboard). Always `await` it. */
export async function passwordOk(input: unknown): Promise<boolean> {
  return (await checkPassword(input)) === "ok";
}

export const sessionSecretSet = () => !!secret();

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
