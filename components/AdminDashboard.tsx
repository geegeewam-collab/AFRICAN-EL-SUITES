"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Block, Booking } from "@/lib/types";
import { todayNairobi } from "@/lib/dates";
import { PRICING_CONFIG } from "@/lib/pricing";
import { bookingRef } from "@/lib/ref";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pct = (r: number) => `${Number((r * 100).toFixed(2))}%`;
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

const STATUS_LABEL: Record<string, string> = { paid: "Paid", pending: "Awaiting payment", failed: "Payment failed", cancelled: "Cancelled" };

type Filter = "all" | "paid" | "pending" | "other";

export interface Health {
  payments: boolean;
  paymentsLive: boolean;
  sms: boolean;
  smsSandbox: boolean;
  email: boolean;
  icalExport: boolean;
  icalImports: number;
}

interface Props {
  bookings: Booking[];
  blocks: Block[];
  propertyName: string;
  propertyWhatsApp?: string;
  commissionRate: number;
  health: Health;
  icalUrl: string | null;
}

export default function AdminDashboard({ bookings, blocks, propertyName, propertyWhatsApp, commissionRate, health, icalUrl }: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(todayNairobi().slice(0, 7));
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [block, setBlock] = useState({ checkIn: "", checkOut: "", note: "" });
  const [manual, setManual] = useState({ guestName: "", guestPhone: "", checkIn: "", checkOut: "", guests: "2" });
  const [linkCopied, setLinkCopied] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const act = async (body: Record<string, unknown>): Promise<boolean> => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Something went wrong.");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordForm.new.length < 12) {
      setPasswordMsg({ type: "error", text: "Password must be at least 12 characters." });
      return;
    }
    setBusy(true);
    setPasswordMsg(null);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
          confirmPassword: passwordForm.confirm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: json.error || "Failed to change password." });
      } else {
        setPasswordMsg({ type: "success", text: "Password updated successfully." });
        setPasswordForm({ current: "", new: "", confirm: "" });
        setShowPasswordForm(false);
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  };

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
    `Service Fee (${pct(commissionRate)}): ${kes(commission)}`,
    "",
    ...paid.map((b) => `- ${nice(b.checkIn)} to ${nice(b.checkOut)} | ${b.guestName} | ${kes(b.totalAmount)} | ${kes(b.commissionAmount)}`),
  ].join("\\n");

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

        <section className={`${card} mb-8`} style={cardStyle}>
          <h2 className="font-serif text-lg mb-3">Today's Focus</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-sm bg-white/5 border border-white/10">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Paid Today</p>
              <p className="text-xl font-serif">{kes(paid.reduce((n, b) => n + b.totalAmount, 0))}</p>
            </div>
            <div className="p-3 rounded-sm bg-white/5 border border-white/10">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Booking Status</p>
              <p className="text-sm">{paid.length} confirmed for {monthLabel}</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg">Bookings</h2>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(["all", "paid", "pending", "other"] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs rounded-sm capitalize ${filter === f ? "bg-[#B8935A] text-[#0B1526]" : "bg-white/5 text-white/70"}`}>
                  {f === "other" ? "Failed / cancelled" : f}
                </button>
              ))}
            </div>
          </div>
          {list.length === 0 ? (
            <p className="text-white/30 text-sm">Nothing here yet.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((b) => (
                <li key={b.id} className={card} style={cardStyle}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium">
                        {b.guestName} <span className="text-white/35 text-xs font-normal ml-1">{bookingRef(b.id)}{b.source === "manual" ? " · manual" : ""}</span>
                      </p>
                      <p className="text-white/50 text-xs">
                        {nice(b.checkIn)} to {nice(b.checkOut)} | {b.nights} night{b.nights > 1 ? "s" : ""} | {b.guests} guest{b.guests > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[11px] rounded-sm whitespace-nowrap ${CHIP[b.paymentStatus] ?? CHIP.cancelled}`}>{STATUS_LABEL[b.paymentStatus] ?? b.paymentStatus}</span>
                  </div>
                  <p className="text-sm text-white/70">
                    Total {kes(b.totalAmount)} | Deposit {kes(b.depositAmount)} | Balance {kes(b.balanceAmount)}
                    {b.mpesaReceipt && <span className="text-white/40"> | {b.mpesaReceipt}</span>}
                    {b.weekdayNights !== undefined && (
                      <span className="block text-white/40 text-xs mt-0.5">
                        {b.weekdayNights} weekday + {b.weekendNights} weekend night{b.nights === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                  {b.notify && (
                    <p className="text-[11px] mt-1.5 flex gap-3 flex-wrap">
                      <Msg label="Guest SMS" v={b.notify.guestSms} />
                      <Msg label="Owner SMS" v={b.notify.ownerSms} />
                      <Msg label="Owner email" v={b.notify.ownerEmail} />
                    </p>
                  )}
                  <p className="text-white/30 text-[11px] mt-1">Created {when(b.createdAtMs)} | Updated {when(b.updatedAtMs)}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {b.guestPhone && <a className={btn} href={`https://wa.me/${b.guestPhone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                    {b.paymentStatus === "paid" && b.guestPhone && (
                      <button className={btn} disabled={busy}
                        onClick={async () => { if (await act({ action: "resendSms", id: b.id })) alert("SMS sent to the guest."); }}>
                        Resend SMS
                      </button>
                    )}
                    {b.whatsappConfirmationMessage && (
                      <a className={btn} href={`https://wa.me/${b.guestPhone}?text=${encodeURIComponent(b.whatsappConfirmationMessage)}`} target="_blank" rel="noopener noreferrer" title="Open WhatsApp with the confirmation message ready to send">WhatsApp confirmation</a>
                    )}
                    {b.guestPhone && <a className={btn} href={`tel:+${b.guestPhone}`}>Call</a>}
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
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Service Fee ({pct(commissionRate)})</p>
              <p className="text-xl font-serif" style={{ color: "#D4B483" }}>{kes(commission)}</p>
            </div>
            <button className={btn} onClick={copy}>{copied ? "Copied" : "Copy statement"}</button>
          </div>
          <p className="text-white/30 text-[11px] mt-3">Counts paid bookings whose stay starts in {monthLabel}.</p>
        </section>

        <section className={`${card} mb-8`} style={cardStyle}>
          <h2 className="font-serif text-lg mb-4">Pricing Configuration</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-white/50">Weekday rate</div>
            <div style={{ color: "#D4B483" }}>KES {PRICING_CONFIG.weekdayRate.toLocaleString()}</div>
            <div className="text-white/50">Weekend rate</div>
            <div style={{ color: "#D4B483" }}>KES {PRICING_CONFIG.weekendRate.toLocaleString()}</div>
            <div className="text-white/50">Deposit rate</div>
            <div style={{ color: "#D4B483" }}>{Math.round(PRICING_CONFIG.depositRate * 100)}%</div>
            <div className="text-white/50">Service Fee</div>
            <div style={{ color: "#D4B483" }}>{pct(PRICING_CONFIG.commissionRate)}</div>
          </div>
        </section>

        <section className={`${card} mb-8`} style={cardStyle}>
          {showPasswordForm ? (
            <form onSubmit={changePassword}>
              <h2 className="font-serif text-lg mb-4">Change Password</h2>
              {passwordMsg && (
                <div className={`mb-4 p-3 rounded-sm text-sm ${passwordMsg.type === "success" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                  {passwordMsg.text}
                </div>
              )}
              <div className="space-y-3 mb-4">
                <label className="flex flex-col gap-1.5 text-white/50 text-sm">
                  Current Password
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm"
                    required
                    disabled={busy}
                    autoComplete="current-password"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-white/50 text-sm">
                  New Password (min 12 chars)
                  <input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm"
                    required
                    disabled={busy}
                    autoComplete="new-password"
                    minLength={12}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-white/50 text-sm">
                  Confirm New Password
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm"
                    required
                    disabled={busy}
                    autoComplete="new-password"
                    minLength={12}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className={btn} style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526", border: "none" }}>
                  {busy ? "Updating..." : "Update Password"}
                </button>
                <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordMsg(null); }} disabled={busy} className={btn}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg mb-1">Change Password</h2>
                <p className="text-white/40 text-xs">Update your admin login password.</p>
              </div>
              <button onClick={() => setShowPasswordForm(true)} className={btn}>
                Change Password
              </button>
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-lg mb-1">Add a booking</h2>
          <p className="text-white/40 text-xs mb-3">For guests who booked by WhatsApp, phone or cash. It blocks the dates and counts in the monthly statement.</p>
          <div className={card} style={cardStyle}>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <input placeholder="Guest name" value={manual.guestName} onChange={(e) => setManual({ ...manual, guestName: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-sm p-2.5 text-white text-sm" />
              <input placeholder="Phone (optional)" inputMode="tel" value={manual.guestPhone} onChange={(e) => setManual({ ...manual, guestPhone: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-sm p-2.5 text-white text-sm" />
              <label className="text-white/40 text-[10px] uppercase tracking-widest">
                Check-in
                <input type="date" value={manual.checkIn} onChange={(e) => setManual({ ...manual, checkIn: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm normal-case tracking-normal" />
              </label>
              <label className="text-white/40 text-[10px] uppercase tracking-widest">
                Check-out
                <input type="date" value={manual.checkOut} onChange={(e) => setManual({ ...manual, checkOut: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm normal-case tracking-normal" />
              </label>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={manual.guests} onChange={(e) => setManual({ ...manual, guests: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm">
                <option value="1" className="text-black">1 guest</option>
                <option value="2" className="text-black">2 guests</option>
              </select>
              <button
                className={btn}
                disabled={busy}
                onClick={async () => {
                  if (await act({ action: "addBooking", ...manual })) setManual({ guestName: "", guestPhone: "", checkIn: "", checkOut: "", guests: "2" });
                }}
              >
                Add booking
              </button>
            </div>
          </div>
        </section>

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

        <section className={`${card} mb-8`} style={cardStyle}>
          <h2 className="font-serif text-lg mb-3">Setup status</h2>
          <ul className="space-y-2 text-sm">
            <Check ok={health.payments && health.paymentsLive} warn={health.payments !== health.paymentsLive} label="Online M-Pesa payments"
              hint={!health.payments ? "Not set up: the site sends WhatsApp booking requests instead" : !health.paymentsLive ? "Daraja is ready but the booking form still uses WhatsApp. Set NEXT_PUBLIC_PAYMENTS_ENABLED=true and redeploy" : "Live"} />
            <Check ok={health.sms && !health.smsSandbox} warn={health.sms && health.smsSandbox} label="Automatic SMS to guest and owner"
              hint={!health.sms ? "Not set up (Africa's Talking keys missing)" : health.smsSandbox ? "Sandbox mode: messages are NOT delivered. Switch AT_USERNAME to your real username" : "Live"} />
            <Check ok={health.email} label="Email alert to owner" hint={health.email ? "Live" : "Not set up (Gmail app password missing)"} />
            <Check ok={health.icalExport} label="Send our bookings to Airbnb / Booking.com" hint={health.icalExport ? "Calendar link ready (below)" : "Not set up (ICAL_EXPORT_TOKEN missing)"} />
            <Check ok={health.icalImports > 0} label="Read Airbnb / Booking.com bookings" hint={health.icalImports > 0 ? `${health.icalImports} calendar${health.icalImports > 1 ? "s" : ""} connected` : "Not set up (ICAL_IMPORT_URLS missing)"} />
          </ul>
          {icalUrl && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/50 text-xs mb-2">
                Paste this link into Airbnb / Booking.com under &quot;Import calendar&quot; so they block nights booked on this site:
              </p>
              <div className="flex gap-2">
                <input readOnly value={icalUrl} onFocus={(e) => e.currentTarget.select()} className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-sm p-2 text-white/70 text-xs" />
                <button
                  className={btn}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(icalUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    } catch {
                      prompt("Copy this link:", icalUrl);
                    }
                  }}
                >
                  {linkCopied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          )}
        </section>
      </div>
    </main>
  );
}

function Check({ ok, warn, label, hint }: { ok: boolean; warn?: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] ${ok ? "bg-emerald-500/20 text-emerald-300" : warn ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/40"}`}>
        {ok ? "✓" : warn ? "!" : "–"}
      </span>
      <span>
        <span className="block text-white/90">{label}</span>
        <span className={`block text-xs ${warn ? "text-amber-300/80" : "text-white/40"}`}>{hint}</span>
      </span>
    </li>
  );
}

function Msg({ label, v }: { label: string; v?: string }) {
  if (!v) return null;
  const color = v === "sent" ? "text-emerald-300/80" : v === "failed" ? "text-red-300" : "text-white/30";
  return <span className={color}>{label}: {v}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/40 text-[10px] uppercase tracking-widest">{label}</p>
      <p className="text-lg font-serif">{value}</p>
    </div>
  );
}
