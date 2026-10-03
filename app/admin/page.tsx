import type { Metadata } from "next";
import { isAdmin } from "@/lib/adminAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { Block, Booking } from "@/lib/types";
import { property } from "@/lib/property";
import { COMMISSION_RATE } from "@/lib/pricing";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner dashboard", robots: { index: false, follow: false } };

function Login({ error }: { error: boolean }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#0B1526" }}>
      <form method="post" action="/api/admin/login" className="w-full max-w-sm">
        <span className="eyebrow">Owner dashboard</span>
        <h1 className="mt-3 text-3xl font-serif text-white mb-6">{property.name}</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="w-full bg-white/5 border border-white/10 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-[#B8935A]"
        />
        {error && <p className="text-red-300 text-xs mt-2">Wrong password. Try again.</p>}
        <button
          type="submit"
          className="w-full mt-4 py-3 text-sm font-medium rounded-sm"
          style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: { e?: string } }) {
  if (!isAdmin()) return <Login error={!!searchParams.e} />;

  const db = adminDb();
  const [bk, bl] = await Promise.all([
    db.collection("bookings").orderBy("createdAtMs", "desc").limit(300).get(),
    db.collection("blocks").orderBy("checkIn").get(),
  ]);
  const bookings = bk.docs.map((d) => ({ id: d.id, ...d.data() })) as Booking[];
  const blocks = bl.docs.map((d: typeof bl.docs[0]) => ({ id: d.id, ...d.data() })) as Block[];

  return <AdminDashboard bookings={bookings} blocks={blocks} propertyName={property.name} commissionRate={COMMISSION_RATE} />;
}
