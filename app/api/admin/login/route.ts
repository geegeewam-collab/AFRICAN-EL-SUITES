import { NextResponse } from "next/server";
import { COOKIE, checkPassword, cookieOpts, makeToken, sessionSecretSet } from "@/lib/adminAuth";

// Plain HTML form posts here (no client JS needed). Also handles logout.
// Error codes shown on the login page:  1 = wrong password, 2 = ADMIN_PASSWORD not set,
// 3 = database unreadable (FIREBASE_SERVICE_ACCOUNT), 4 = ADMIN_SESSION_SECRET not set.
export async function POST(req: Request) {
  const form = await req.formData();
  const back = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);

  if (form.get("logout")) {
    const res = back("/admin");
    res.cookies.delete(COOKIE);
    return res;
  }

  const result = await checkPassword(form.get("password"));
  if (result === "wrong") {
    await new Promise((r) => setTimeout(r, 1000)); // slow down guessing
    return back("/admin?e=1");
  }
  if (result === "not-configured") return back("/admin?e=2");
  if (result === "db-error") return back("/admin?e=3");

  // Password was right, but without ADMIN_SESSION_SECRET the cookie can never be verified and
  // you would just bounce back to the login page with no explanation.
  if (!sessionSecretSet()) return back("/admin?e=4");

  const res = back("/admin");
  res.cookies.set(COOKIE, makeToken(), cookieOpts);
  return res;
}
