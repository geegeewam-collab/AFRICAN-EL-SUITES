import { NextResponse } from "next/server";
import { isAdmin, passwordOk, setAdminPassword } from "@/lib/adminAuth";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  if (!isAdmin()) return fail("Not signed in.", 401);

  // Same-site JSON only
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return fail("Bad origin.", 403);
  if (!req.headers.get("content-type")?.includes("application/json")) return fail("Bad request.");

  const body = await req.json().catch(() => null);
  if (!body) return fail("Bad request.");

  const { currentPassword, newPassword, confirmPassword } = body;
  if ([currentPassword, newPassword, confirmPassword].some((v) => typeof v !== "string" || !v)) {
    return fail("All fields are required.");
  }
  if (newPassword !== confirmPassword) return fail("New passwords do not match.");
  if (newPassword.length < 12) return fail("Password must be at least 12 characters long.");
  if (newPassword.length > 200) return fail("Password is too long.");

  if (!(await passwordOk(currentPassword))) return fail("Current password is incorrect.");

  try {
    await setAdminPassword(newPassword);
    return NextResponse.json({ ok: true, message: "Password updated successfully." });
  } catch (e) {
    console.error("Failed to update password:", e);
    return fail("Could not update password. Please try again.", 500);
  }
}
