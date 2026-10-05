"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, CreditCard, Loader2, MessageCircle, Smartphone, Users } from "lucide-react";
import { HostProfile } from "@/lib/types";
import { PRICING_CONFIG, quote } from "@/lib/pricing";
import { Range } from "@/lib/dates";
import AvailabilityCalendar from "./AvailabilityCalendar";

// Online payment is switched on with NEXT_PUBLIC_PAYMENTS_ENABLED=true (set it once M-Pesa is live).
// Until then the same form sends a booking REQUEST to WhatsApp, so the site works from day one.
const PAYMENTS_ON = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
const SMS_ON = process.env.NEXT_PUBLIC_SMS_ENABLED === "true";

type Phase = "form" | "sending" | "waiting" | "paid" | "unpaid" | "timeout";
type Paid = { ref: string; deposit: number; balance: number; checkIn: string; checkOut: string };

const kes = (n: number) => `KES ${Number(n).toLocaleString("en-US")}`;
const nice = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const PHONE_OK = /^(?:\+?254|0)[17]\d{8}$/;
const gold = { background: "linear-gradient(135deg, #B8935A 0%, #D4B483 50%, #8F7143 100%)", color: "#0B1526" };
const muted = { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" };
const input =
  "w-full bg-white/5 border border-white/10 rounded-sm px-3.5 py-3.5 text-white text-[15px] placeholder:text-white/30 focus:outline-none focus:border-[#B8935A] focus:ring-1 focus:ring-[#B8935A] transition-all disabled:opacity-60";

export default function SpaceBooking({ host }: { host: HostProfile }) {
  const deposit = Math.round(PRICING_CONFIG.depositRate * 100);
  const steps = PAYMENTS_ON
    ? [
        { n: "01", icon: CalendarCheck, title: "Choose dates", desc: "Pick your check-in and check-out on the calendar." },
        { n: "02", icon: ClipboardCheck, title: "Pay deposit", desc: `Secure your stay with a ${deposit}% deposit via M-Pesa.` },
        { n: "03", icon: Smartphone, title: "Get confirmed", desc: "Your booking is confirmed instantly, with a reference number." },
      ]
    : [
        { n: "01", icon: CalendarCheck, title: "Choose dates", desc: "Pick your check-in and check-out on the calendar." },
        { n: "02", icon: MessageCircle, title: "Send your request", desc: "One tap opens WhatsApp with your dates and price filled in." },
        { n: "03", icon: Smartphone, title: "Get confirmed", desc: `We confirm availability and share how to pay the ${deposit}% deposit.` },
      ];

  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paid, setPaid] = useState<Paid | null>(null);
  const [ranges, setRanges] = useState<Range[]>([]);
  const [dates, setDates] = useState({ checkin: "", checkout: "" });
  const [guests, setGuests] = useState("2");
  const [info, setInfo] = useState({ name: "", phone: "" });

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // keep the status screen (waiting / booked / failed) in view when the card changes height
    if (phase !== "form" && phase !== "sending") cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [phase]);

  const loadRanges = useCallback(() => {
    fetch("/api/availability", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRanges(j.ranges ?? []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadRanges();
  }, [loadRanges]);

  const q = quote(dates.checkin, dates.checkout);
  const haveDates = !!dates.checkin && !!dates.checkout;
  const phoneClean = info.phone.replace(/[\s-]/g, "");
  const phoneValid = PHONE_OK.test(phoneClean);
  const nameValid = info.name.trim().length >= 2;
  const busy = phase === "sending";

  // After the M-Pesa prompt: check every 3 seconds (up to ~2.5 minutes) whether the payment landed.
  useEffect(() => {
    if (phase !== "waiting" || !bookingId) return;
    let stopped = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (stopped) return;
      tries++;
      try {
        const r = await fetch(`/api/booking-status?id=${bookingId}`, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j.status === "paid") {
            setPaid({ ref: j.ref, deposit: j.depositAmount, balance: j.balanceAmount, checkIn: j.checkIn, checkOut: j.checkOut });
            setPhase("paid");
            loadRanges();
            return;
          }
          if (j.status === "failed" || j.status === "cancelled") {
            setPhase("unpaid");
            loadRanges();
            return;
          }
        }
      } catch {
        /* keep trying */
      }
      if (tries >= 50) return setPhase("timeout");
      timer = setTimeout(tick, 3000);
    };
    timer = setTimeout(tick, 3000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [phase, bookingId, loadRanges]);

  const startPayment = async () => {
    setError(null);
    if (!q) return setError("Please choose your check-in and check-out dates.");
    if (!nameValid) return setError("Please enter your full name.");
    if (!phoneValid) return setError("Enter the Safaricom number to pay with, e.g. 0712 345 678.");
    setPhase("sending");
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: info.name.trim(), guestPhone: phoneClean, checkIn: dates.checkin, checkOut: dates.checkout, guests: parseInt(guests, 10) }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setBookingId(json.bookingId);
        setPhase("waiting");
        return;
      }
      setError(json.error || "Something went wrong. Please try again.");
      setPhase("form");
      if (res.status === 409) {
        loadRanges();
        setDates({ checkin: "", checkout: "" });
      }
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
      setPhase("form");
    }
  };

  const reset = () => {
    setPhase("form");
    setError(null);
    setBookingId(null);
    setPaid(null);
    setDates({ checkin: "", checkout: "" });
    loadRanges();
  };

  const waNumber = host.whatsappNumber;
  const requestLink = q
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        [
          `Hi! I'd like to book ${host.name}.`,
          "",
          `📅 ${nice(dates.checkin)} to ${nice(dates.checkout)} (${q.nights} night${q.nights > 1 ? "s" : ""})`,
          `👥 ${guests} guest${guests === "1" ? "" : "s"}`,
          `💰 Total ${kes(q.total)} (deposit ${kes(q.deposit)})`,
          info.name.trim() ? `👤 ${info.name.trim()}` : "",
          "",
          "Is it available? How do I pay the deposit?",
        ]
          .filter((l, i, a) => l !== "" || (a[i - 1] !== "" && i !== a.length - 1))
          .join("\n")
      )}`
    : undefined;
  const helpLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi! I need help with my booking at ${host.name}.${bookingId ? ` (ref ${bookingId.slice(-4).toUpperCase()})` : ""}`)}`;

  const collage = (
    <div className="grid grid-cols-2 gap-2.5 mt-8">
      <div className="relative rounded-sm overflow-hidden row-span-2" style={{ aspectRatio: "3/4" }}>
        <Image src={host.gallery[0].src} alt={host.gallery[0].alt} fill className="object-cover" sizes="(min-width:1024px) 25vw, 45vw" />
      </div>
      <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <Image src={host.gallery[1].src} alt={host.gallery[1].alt} fill className="object-cover" sizes="(min-width:1024px) 25vw, 45vw" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[2, 3].map((i) => (
          <div key={i} className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1/1" }}>
            <Image src={host.gallery[i].src} alt={host.gallery[i].alt} fill className="object-cover" sizes="(min-width:1024px) 12vw, 22vw" />
          </div>
        ))}
      </div>
    </div>
  );

  const showForm = phase === "form" || phase === "sending";

  return (
    <section id="book" className="section-pad" style={{ backgroundColor: "#F6F1E6" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-start">
        {/* Left: story + photos */}
        <div className="lg:sticky lg:top-28">
          <span className="eyebrow" style={{ color: "#8F7143" }}>The Space</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif mb-5 leading-tight" style={{ color: "#0B1526" }}>
            A sanctuary of <br className="hidden sm:block" /> stillness and style.
          </h2>
          <p className="max-w-md leading-relaxed mb-6" style={{ color: "#5B564B" }}>{host.description}</p>
          <a href="#gallery" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide" style={{ color: "#8F7143" }}>
            EXPLORE THE AESTHETIC <ArrowRight size={15} />
          </a>
          {collage}
        </div>

        {/* Right: booking card */}
        <div ref={cardRef} className="rounded-sm shadow-xl" style={{ backgroundColor: "#0B1526", border: "1px solid rgba(184,147,90,0.2)" }}>
          <div className="p-6 sm:p-8 md:p-9">
            <div className="mb-7">
              <span className="eyebrow">{PAYMENTS_ON ? "Direct Booking" : "Book Direct"}</span>
              <h3 className="mt-3 text-2xl md:text-3xl font-serif text-white mb-2 leading-tight">Book your stay</h3>
              <p className="text-white/50 text-sm">Direct is always the best rate. No platform fees.</p>
            </div>

            {showForm && (
              <ol className="flex flex-col gap-4 mb-8">
                {steps.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.n} className="flex gap-4 items-start">
                      <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 bg-white/5 text-white/60">
                        <Icon size={15} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-white mb-0.5">{s.title}</span>
                        <span className="block text-xs leading-relaxed text-white/45">{s.desc}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            {/* ---------- waiting for M-Pesa ---------- */}
            {phase === "waiting" && (
              <div className="text-center py-6" role="status" aria-live="polite">
                <Loader2 className="mx-auto mb-5 animate-spin" size={34} style={{ color: "#D4B483" }} />
                <h4 className="text-white font-serif text-2xl mb-2">Check your phone</h4>
                <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
                  Enter your M-Pesa PIN to pay the <strong className="text-white">{q ? kes(q.deposit) : "deposit"}</strong> deposit. This page updates by itself the moment the payment goes through.
                </p>
                <button onClick={reset} className="mt-6 text-white/40 hover:text-white text-xs underline">Cancel and start again</button>
              </div>
            )}

            {/* ---------- paid ---------- */}
            {phase === "paid" && paid && (
              <div className="text-center py-4 animate-fade-up" role="status" aria-live="polite">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(184,147,90,0.15)", border: "1px solid rgba(184,147,90,0.35)" }}>
                  <CheckCircle2 size={30} style={{ color: "#D4B483" }} />
                </div>
                <h4 className="text-white font-serif text-2xl mb-1">You&apos;re booked!</h4>
                <p className="text-white/50 text-sm mb-6">Keep your reference number safe.</p>
                <div className="rounded-sm p-5 text-left mb-6" style={{ background: "rgba(184,147,90,0.08)", border: "1px solid rgba(184,147,90,0.25)" }}>
                  <Row label="Reference" value={paid.ref} strong />
                  <Row label="Stay" value={`${nice(paid.checkIn)} to ${nice(paid.checkOut)}`} />
                  <Row label="Deposit paid" value={kes(paid.deposit)} />
                  <Row label="Balance on arrival" value={kes(paid.balance)} last />
                </div>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">
                  {SMS_ON ? "A confirmation SMS is on its way to your phone. " : ""}We&apos;ll send your access details on WhatsApp. Message us any time if you need anything.
                </p>
                <a href={helpLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 text-sm font-medium rounded-sm" style={gold}>
                  <MessageCircle size={16} /> Message us on WhatsApp
                </a>
              </div>
            )}

            {/* ---------- payment didn't happen ---------- */}
            {(phase === "unpaid" || phase === "timeout") && (
              <div className="text-center py-4" role="status" aria-live="polite">
                <AlertCircle className="mx-auto mb-4" size={34} style={{ color: "#F59E0B" }} />
                <h4 className="text-white font-serif text-2xl mb-2">{phase === "unpaid" ? "Payment wasn't completed" : "Still waiting for payment"}</h4>
                <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                  {phase === "unpaid"
                    ? "No money was taken and your dates are released. You can try again."
                    : "We haven't received your payment yet. If you already paid, don't worry: it will show up shortly and we'll confirm your booking. Otherwise you can try again."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={reset} className="px-7 py-3.5 text-sm font-medium rounded-sm" style={gold}>Try again</button>
                  <a href={helpLink} target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 text-sm font-medium rounded-sm border border-white/20 text-white hover:bg-white/5">Ask us on WhatsApp</a>
                </div>
              </div>
            )}

            {/* ---------- the form ---------- */}
            {showForm && (
              <>
                {error && (
                  <div role="alert" className="mb-5 p-4 rounded-sm flex items-start gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-400" />
                    <p className="text-sm text-red-200 flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-white/50 hover:text-white text-xl leading-none px-1" aria-label="Dismiss">×</button>
                  </div>
                )}

                <div className="mb-6">
                  <AvailabilityCalendar
                    ranges={ranges}
                    checkIn={dates.checkin}
                    checkOut={dates.checkout}
                    onChange={(ci, co) => {
                      setDates({ checkin: ci, checkout: co });
                      setError(null);
                    }}
                  />
                  {haveDates && !q && (
                    <p className="mt-3 text-amber-300/90 text-xs">
                      Online bookings are for up to {PRICING_CONFIG.maxNights} nights. For a longer stay, <a className="underline" href={helpLink} target="_blank" rel="noopener noreferrer">message us</a> and we&apos;ll arrange it.
                    </p>
                  )}
                </div>

                <fieldset className="mb-6" disabled={busy}>
                  <legend className="flex items-center gap-2 text-white/45 text-[11px] uppercase tracking-widest mb-3">
                    <Users size={12} style={{ color: "#B8935A" }} /> Your details
                  </legend>
                  <div className="grid gap-3">
                    <label className="block">
                      <span className="sr-only">Full name</span>
                      <input type="text" autoComplete="name" placeholder="Full name" className={input} value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="sr-only">{PAYMENTS_ON ? "M-Pesa phone number" : "Phone number"}</span>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder={PAYMENTS_ON ? "M-Pesa number, e.g. 0712 345 678" : "Phone (optional)"}
                        className={input}
                        value={info.phone}
                        onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                      />
                    </label>
                    {PAYMENTS_ON && info.phone && !phoneValid && <p className="text-amber-300/90 text-xs -mt-1">Use a Safaricom number like 0712 345 678.</p>}
                  </div>
                  <div className="flex gap-2 mt-3" role="group" aria-label="Number of guests">
                    {["1", "2"].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setGuests(n)}
                        aria-pressed={guests === n}
                        className={`flex-1 py-3 text-sm rounded-sm font-medium transition-colors ${guests === n ? "bg-[#B8935A] text-[#0B1526]" : "bg-white/5 text-white border border-white/10 hover:bg-white/10"}`}
                      >
                        {n} guest{n === "1" ? "" : "s"}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {q && (
                  <div className="mb-6 p-5 rounded-sm" style={{ background: "linear-gradient(135deg, rgba(184,147,90,0.12), rgba(184,147,90,0.04))", border: "1px solid rgba(184,147,90,0.25)" }}>
                    <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#B8935A" }}>
                      Price · {q.nights} night{q.nights > 1 ? "s" : ""}
                    </p>
                    <div className="space-y-2.5 text-sm">
                      {q.weekdayNights > 0 && <Line label={`${q.weekdayNights} weekday night${q.weekdayNights > 1 ? "s" : ""}`} value={kes(q.weekdayNights * PRICING_CONFIG.weekdayRate)} />}
                      {q.weekendNights > 0 && <Line label={`${q.weekendNights} weekend night${q.weekendNights > 1 ? "s" : ""}`} value={kes(q.weekendNights * PRICING_CONFIG.weekendRate)} />}
                      <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between">
                        <span className="text-white font-medium">Total</span>
                        <span className="text-xl font-serif" style={{ color: "#D4B483" }}>{kes(q.total)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Deposit ({deposit}%)</p>
                        <p className="font-serif text-lg" style={{ color: "#D4B483" }}>{kes(q.deposit)}</p>
                      </div>
                      <div className="p-3 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">On arrival</p>
                        <p className="font-serif text-lg" style={{ color: "#D4B483" }}>{kes(q.balance)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {PAYMENTS_ON ? (
                  <button
                    onClick={startPayment}
                    disabled={busy || !q || !nameValid || !phoneValid}
                    className="w-full py-4 text-[15px] font-medium rounded-sm flex items-center justify-center gap-3 transition-colors disabled:cursor-not-allowed"
                    style={busy || (q && nameValid && phoneValid) ? gold : muted}
                    aria-busy={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Sending M-Pesa prompt…
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} /> {q ? `Pay ${kes(q.deposit)} deposit` : "Confirm & pay deposit"}
                      </>
                    )}
                  </button>
                ) : (
                  <a
                    href={requestLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!q}
                    onClick={(e) => {
                      if (!q) {
                        e.preventDefault();
                        setError("Please choose your check-in and check-out dates first.");
                      }
                    }}
                    className="w-full py-4 text-[15px] font-medium rounded-sm flex items-center justify-center gap-3 transition-colors"
                    style={q ? gold : muted}
                  >
                    <MessageCircle size={18} /> Request these dates on WhatsApp
                  </a>
                )}

                <p className="text-white/40 text-xs text-center mt-4 leading-relaxed">
                  {PAYMENTS_ON
                    ? q
                      ? `You'll get an M-Pesa prompt for ${kes(q.deposit)}. The balance of ${kes(q.balance)} is paid on arrival.`
                      : "Select your dates to see your total and deposit."
                    : q
                      ? "No payment now. We'll confirm availability and tell you how to pay the deposit."
                      : "Select your dates to see your total."}
                </p>
                <p className="text-white/25 text-[11px] text-center mt-2">We only use your details to manage this booking.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/75">{label}</span>
      <span style={{ color: "#D4B483" }}>{value}</span>
    </div>
  );
}

function Row({ label, value, strong, last }: { label: string; value: string; strong?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${last ? "" : "border-b border-white/10"}`}>
      <span className="text-white/50 text-sm">{label}</span>
      <span className={strong ? "font-serif text-xl tracking-wider" : "text-white text-sm"} style={strong ? { color: "#D4B483" } : undefined}>{value}</span>
    </div>
  );
}
