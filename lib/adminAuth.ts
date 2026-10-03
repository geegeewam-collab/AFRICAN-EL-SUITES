import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

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

export function passwordOk(input: string) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real) return false;
  // Hash both sides so the comparison is constant-time and length-independent.
  const a = createHmac("sha256", "pw").update(input).digest();
  const b = createHmac("sha256", "pw").update(real).digest();
  return timingSafeEqual(a, b);
}

export const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: WEEK_MS / 1000,
};
