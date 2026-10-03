"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Block, Booking } from "@/lib/types";
import { todayNairobi } from "@/lib/dates";
import { COMMISSION_RATE, PRICING_CONFIG } from "@/lib/pricing";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const kes = (n: number) => `KES ${Number(n || 0).toLocaleString("en-US")}`;
const nice = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const when = (ms: number) =>
  new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });

const CHIP: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-amber-500/15 text-amber-300",
  failed: "bg-red-500/15 text-red-300",
  cancelled: "bg-white/10 text-white/50",
};

const BOOKING_STATUS_CHIP: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-amber-500/15 text-amber-300",
  failed: "bg-red-500/15 text-red-300",
  cancelled: "bg-white/10 text-white/50",
};

type Filter = "all" | "paid" | "pending" | "other";

interface Props {
  bookings: Booking[];
  blocks: Block[];
  propertyName: string;
  commissionRate: number;
}

export default function AdminDashboard({ bookings, blocks, propertyName, commissionRate }: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(todayNairobi().slice(0, 7));
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [block, setBlock] = useState({ checkIn: "", checkOut: "", note: "" });

  const act = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) alert(json.error || "Something went wrong.");
      else router.refresh();
    } finally {
      setBusy(false);
    }
  };

  // Monthly statement = paid bookings whose stay STARTS in the chosen month.
  const [y, m] = month.split("-").map(Number);
  const monthLabel = `${MONTHS[m - 1]} ${y}`;
  const shift = (n: number) => setMonth(new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7));
  const paid = bookings.filter((b) => b.paymentStatus === "paid" && b.checkIn.startsWith(month)).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const nights = paid.reduce((n, b) => n + b.nights, 0);
  const booked = paid.reduce((n, b) => n + b.totalAmount, 0);
  const deposits = paid.reduce((n, b) => n + b.depositAmount, 0);
  const commission = paid.reduce((n, b) => n + b.commissionAmount, 0);

  const statement = [
    `${propertyName} | ${monthLabel}`,
    `${paid.length} paid booking${paid.length === 1 ? "" : "s"}, ${nights} night${nights === 1 ? "" : "s"}`,
    `Booked through the site: ${kes(booked)}`,
    `Commission (${Math.round(commissionRate * 100)}%): ${kes(commission)}`,
    "",
    ...paid.map((b) => `- ${nice(b.checkIn)} to ${nice(b.checkOut)} | ${b.guestName} | ${kes(b.totalAmount)} | ${kes(b.commissionAmount)}`),
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(statement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(statement);
    }
  };

  const list = bookings.filter((b) =>
    filter === "all" ? true : filter === "other" ? b.paymentStatus === "failed" || b.paymentStatus === "cancelled" : b.paymentStatus === filter
  );

  const card = "rounded-sm p-4";
  const cardStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
  const btn = "px-3 py-1.5 text-xs rounded-sm border border-white/15 text-white/80 disabled:opacity-40";

  return (
    <main className="min-h-screen px-4 py-8 text-white" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="eyebrow">Owner dashboard</span>
            <h1 className="mt-2 text-2xl font-serif">{propertyName}</h1>
          </div>
          <form method="post" action="/api/admin/login">
            <input type="hidden" name="logout" value="1" />
            <button className={btn}>Log out</button>
          </form>
        </div>

        {/* Monthly summary */}
        <section className={`${card} mb-8`} style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <button className={btn} onClick={() => shift(-1)}>‹</button>
            <h2 className="font-serif text-lg">{monthLabel}</h2>
            <button className={btn} onClick={() => shift(1)}>›</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat label="Paid bookings" value={String(paid.length)} />
            <Stat label="Nights" value={String(nights)} />
            <Stat label="Booked via site" value={kes(booked)} />
            <Stat label="Deposits collected" value={kes(deposits)} />
          </div>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Commission ({Math.round(commissionRate * 100)}%)</p>
              <p className="text-xl font-serif" style={{ color: "#D4B483" }}>{kes(commission)}</p>
            </div>
            <button className={btn} onClick={copy}>{copied ? "Copied" : "Copy statement"}</button>
          </div>
          <p className="text-white/30 text-[11px] mt-3">Counts paid bookings whose stay starts in {monthLabel}.</p>
        </section>

        {/* Pricing config display */}
        <section className={`${card} mb-8`} style={cardStyle}>
          <h2 className="font-serif text-lg mb-4">Pricing Configuration</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-white/50">Weekday rate</div>
            <div style={{ color: "#D4B483" }}>KES {PRICING_CONFIG.weekdayRate.toLocaleString()}</div>
            <div className="text-white/50">Weekend rate</div>
            <div style={{ color: "#D4B483" }}>KES {PRICING_CONFIG.weekendRate.toLocaleString()}</div>
            <div className="text-white/50">Deposit rate</div>
            <div style={{ color: "#D4B483" }}>{Math.round(PRICING_CONFIG.depositRate * 100)}%</div>
            <div className="text-white/50">Developer commission</div>
            <div style={{ color: "#D4B483" }}>{Math.round(PRICING_CONFIG.commissionRate * 100)}%</div>
          </div>
        </section>

        {/* Blocked dates */}
        <section className="mb-8">
          <h2 className="font-serif text-lg mb-1">Blocked dates</h2>
          <p className="text-white/40 text-xs mb-3">Block nights taken elsewhere (Airbnb, family, repairs) so the site never double-books them.</p>
          <div className={`${card} mb-3`} style={cardStyle}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="text-white/40 text-[10px] uppercase tracking-widest">
                First night
                <input type="date" value={block.checkIn} onChange={(e) => setBlock({ ...block, checkIn: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm normal-case tracking-normal" />
              </label>
              <label className="text-white/40 text-[10px] uppercase tracking-widest">
                Check-out day
                <input type="date" value={block.checkOut} onChange={(e) => setBlock({ ...block, checkOut: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm normal-case tracking-normal" />
              </label>
            </div>
            <input placeholder="Note (e.g. Airbnb guest)" value={block.note} onChange={(e) => setBlock({ ...block, note: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm mb-3" />
            <button
              className={btn}
              disabled={busy}
              onClick={async () => {
                await act({ action: "addBlock", ...block });
                setBlock({ checkIn: "", checkOut: "", note: "" });
              }}
            >
              Block these dates
            </button>
          </div>
          {blocks.length === 0 ? (
            <p className="text-white/30 text-xs">No blocked dates.</p>
          ) : (
            <ul className="space-y-2">
              {blocks.map((b) => (
                <li key={b.id} className={`${card} flex items-center justify-between gap-3`} style={cardStyle}>
                  <span className="text-sm">
                    {nice(b.checkIn)} to {nice(b.checkOut)}
                    {b.note && <span className="text-white/40"> | {b.note}</span>}
                  </span>
                  <button className={btn} disabled={busy} onClick={() => confirm("Unblock these dates?") && act({ action: "removeBlock", id: b.id })}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Bookings */}
        <section>
          <h2 className="font-serif text-lg mb-3">Bookings</h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(["all", "paid", "pending", "other"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-sm capitalize ${filter === f ? "bg-[#B8935A] text-[#0B1526]" : "bg-white/5 text-white/70"}`}>
                {f === "other" ? "Failed / cancelled" : f}
              </button>
            ))}
          </div>
          {list.length === 0 ? (
            <p className="text-white/30 text-sm">Nothing here yet.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((b) => (
                <li key={b.id} className={card} style={cardStyle}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium">{b.guestName}</p>
                      <p className="text-white/50 text-xs">
                        {nice(b.checkIn)} to {nice(b.checkOut)} | {b.nights} night{b.nights > 1 ? "s" : ""} | {b.guests} guest{b.guests > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 text-[11px] rounded-sm capitalize ${CHIP[b.paymentStatus] ?? CHIP.cancelled}`}>{b.paymentStatus}</span>
                      <span className={`px-2 py-0.5 text-[11px] rounded-sm capitalize ${BOOKING_STATUS_CHIP[b.bookingStatus] ?? BOOKING_STATUS_CHIP.cancelled}`}>{b.bookingStatus}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/70">
                    Total {kes(b.totalAmount)} | Deposit {kes(b.depositAmount)} | Balance {kes(b.balanceAmount)}
                    {b.mpesaReceipt && <span className="text-white/40"> | {b.mpesaReceipt}</span>}
                    {b.weekdayNights !== undefined && (
                      <span className="text-white/40 ml-2">({b.weekdayNights}wk / {b.weekendNights}we)</span>
                    )}
                  </p>
                  <p className="text-white/30 text-[11px] mt-1">Created {when(b.createdAtMs)} | Updated {when(b.updatedAtMs)}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <a className={btn} href={`https://wa.me/${b.guestPhone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <a className={btn} href={`tel:+${b.guestPhone}`}>Call</a>
                    {(b.paymentStatus === "pending" || b.paymentStatus === "failed") && (
                      <button className={btn} disabled={busy}
                        onClick={() => {
                          const r = prompt("M-Pesa receipt code (optional):");
                          if (r !== null) act({ action: "markPaid", id: b.id, receipt: r });
                        }}>
                        Mark paid
                      </button>
                    )}
                    {(b.paymentStatus === "paid" || b.paymentStatus === "pending") && (
                      <button className={btn} disabled={busy}
                        onClick={() => confirm(`Cancel ${b.guestName}'s booking? The dates will open up again.`) && act({ action: "cancel", id: b.id })}>
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/40 text-[10px] uppercase tracking-widest">{label}</p>
      <p className="text-lg font-serif">{value}</p>
    </div>
  );
}