import { NextResponse } from "next/server";
import { COOKIE, cookieOpts, makeToken, passwordOk } from "@/lib/adminAuth";

// Plain HTML form posts here (no client JS needed). Also handles logout.
export async function POST(req: Request) {
  const form = await req.formData();
  const back = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);

  if (form.get("logout")) {
    const res = back("/admin");
    res.cookies.delete(COOKIE);
    return res;
  }

  if (!(await passwordOk(form.get("password")))) {
    await new Promise((r) => setTimeout(r, 1000)); // slow down guessing
    return back("/admin?e=1");
  }

  const res = back("/admin");
  res.cookies.set(COOKIE, makeToken(), cookieOpts);
  return res;
}
