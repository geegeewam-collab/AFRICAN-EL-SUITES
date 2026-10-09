import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { Block, Booking } from "@/lib/types";
import { property, SITE_URL } from "@/lib/property";
import { paymentsConfigured } from "@/lib/payments";
import { smsConfigured } from "@/lib/sms";
import { emailConfigured } from "@/lib/notify";
import { importUrls } from "@/lib/ical";
import { COMMISSION_RATE } from "@/lib/pricing";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner dashboard", robots: { index: false, follow: false } };

const LOGIN_ERRORS: Record<string, string> = {
  "1": "Wrong password. Try again.",
  "2": "No password is set on this deployment. Add ADMIN_PASSWORD in Vercel (Settings > Environment Variables), then redeploy.",
  "3": "Can't reach the database to check the password. Check FIREBASE_SERVICE_ACCOUNT in Vercel and that Firestore is created, then redeploy. The exact reason is in Vercel > Logs.",
  "4": "Password accepted, but ADMIN_SESSION_SECRET is missing. Add 40+ random characters as ADMIN_SESSION_SECRET in Vercel, then redeploy.",
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#0B1526" }}>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}

function Login({ code }: { code?: string }) {
  return (
    <Shell>
      <form method="post" action="/api/admin/login" className="w-full">
        <span className="eyebrow">Owner dashboard</span>
        <h1 className="mt-3 text-3xl font-serif text-white mb-6">{property.name}</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          autoComplete="current-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full bg-white/5 border border-white/10 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-[#B8935A]"
        />
        {code && <p className="text-red-300 text-xs mt-2">{LOGIN_ERRORS[code] ?? LOGIN_ERRORS["1"]}</p>}
        <button
          type="submit"
          className="w-full mt-4 py-3 text-sm font-medium rounded-sm"
          style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
        >
          Sign in
        </button>
      </form>
    </Shell>
  );
}

// Signed in correctly, but Firestore isn't usable yet: say so instead of crashing with "Application error".
function DatabaseProblem() {
  return (
    <Shell>
      <span className="eyebrow">Owner dashboard</span>
      <h1 className="mt-3 text-3xl font-serif text-white mb-4">You are signed in</h1>
      <p className="text-white/80 text-sm leading-relaxed">
        The password works, but the dashboard cannot reach its database yet, so it has no bookings to show.
      </p>
      <p className="text-white/60 text-xs leading-relaxed mt-3">
        Do step 2 in SETUP.md: create the Firestore database, then paste the whole service-account JSON into
        Vercel as FIREBASE_SERVICE_ACCOUNT and redeploy. The exact error is in Vercel &gt; Logs (search for [admin]).
      </p>
      <form method="post" action="/api/admin/login" className="mt-6">
        <input type="hidden" name="logout" value="1" />
        <button type="submit" className="text-xs text-white/60 underline">Sign out</button>
      </form>
    </Shell>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: { e?: string } }) {
  if (!isAdmin()) return <Login code={searchParams.e} />;

  let bookings: Booking[];
  let blocks: Block[];
  try {
    const db = adminDb();
    const [bk, bl] = await Promise.all([
      db.collection("bookings").orderBy("createdAtMs", "desc").limit(300).get(),
      db.collection("blocks").orderBy("checkIn").get(),
    ]);
    bookings = bk.docs.map((d) => ({ id: d.id, ...d.data() })) as Booking[];
    blocks = bl.docs.map((d: typeof bl.docs[0]) => ({ id: d.id, ...d.data() })) as Block[];
  } catch (e) {
    console.error("[admin] Dashboard could not load from Firestore:", e instanceof Error ? e.message : e);
    return <DatabaseProblem />;
  }

  const token = process.env.ICAL_EXPORT_TOKEN;
  const health = {
    payments: paymentsConfigured(),
    paymentsLive: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true",
    sms: smsConfigured(),
    smsSandbox: process.env.AT_USERNAME === "sandbox",
    email: emailConfigured(),
    icalExport: !!token,
    icalImports: importUrls().length,
  };

  return (
    <AdminDashboard
      bookings={bookings}
      blocks={blocks}
      propertyName={property.name}
      propertyWhatsApp={property.whatsappNumber}
      commissionRate={COMMISSION_RATE}
      health={health}
      icalUrl={token ? `${SITE_URL}/api/calendar.ics?token=${token}` : null}
    />
  );
}
