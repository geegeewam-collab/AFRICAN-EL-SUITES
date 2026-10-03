"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { HostProfile } from "@/lib/types";
import { getBookingInquiryWhatsAppUrl } from "@/lib/whatsapp";

interface HeroProps {
  host: HostProfile;
}

export default function Hero({ host }: HeroProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [focusedField, setFocusedField] = useState<"checkin" | "checkout" | "guests" | null>(null);

  const handleCheck = () => {
    if (!checkIn || !checkOut) {
      // If dates not selected, just open WhatsApp with guest count
      const url = getBookingInquiryWhatsAppUrl({
        checkIn,
        checkOut,
        guests: parseInt(guests, 10),
      });
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const url = getBookingInquiryWhatsAppUrl({
      checkIn,
      checkOut,
      guests: parseInt(guests, 10),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  };

  const hasDates = checkIn && checkOut;

  return (
    <section className="relative min-h-[720px] flex items-end overflow-hidden pt-28 pb-40 md:pb-48">
      <div className="absolute inset-0 z-0">
        <Image
          src={host.heroImage}
          alt={`${host.name} — ${host.address.area}`}
          fill
          priority
          className="object-cover object-[center_30%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,21,38,0.6) 0%, rgba(11,21,38,0.35) 40%, rgba(11,21,38,0.95) 100%)",
          }}
        />
      </div>

      <div
        className="chevron-texture absolute top-0 left-0 w-40 h-40 opacity-40 z-[1] pointer-events-none"
        style={{
          WebkitMaskImage: "radial-gradient(circle at top left, black, transparent 70%)",
          maskImage: "radial-gradient(circle at top left, black, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 animate-fade-up">
        <div className="max-w-xl mb-10 md:mb-0">
          <span className="eyebrow">{host.address.area} · {host.address.line1}</span>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.08] mb-5">
            {host.heroTitle}
          </h1>
          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-2 max-w-md">
            {host.heroSubtext}
          </p>
        </div>

        {/* Search/Booking Card */}
        <div
          className="mt-8 rounded-sm p-4 md:p-6 flex flex-col md:flex-row gap-3 md:gap-0 md:items-end w-full md:max-w-2xl"
          style={{ background: "rgba(15,26,46,0.95)", border: "1px solid rgba(184,147,90,0.3)", backdropFilter: "blur(12px)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
        >
          <div className={`flex-1 md:border-r border-white/10 md:pr-4 relative ${focusedField === "checkin" ? "z-10" : ""}`}>
            <label className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.15em] uppercase text-white/45 mb-1.5">
              <CalendarDays size={12} /> Check-in
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={18} />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (!checkOut && e.target.value) setFocusedField("checkout");
                }}
                onFocus={() => setFocusedField("checkin")}
                onBlur={() => setFocusedField(null)}
                className="bg-transparent text-white text-sm w-full pl-10 pr-4 py-3 outline-none"
                min={new Date().toISOString().split("T")[0]}
                aria-label="Check-in date"
              />
            </div>
            {checkIn && (
              <p className="mt-2 text-xs text-white/50">Check-in: {formatDate(checkIn)}</p>
            )}
          </div>

          <div className={`flex-1 md:border-r border-white/10 md:px-4 relative ${focusedField === "checkout" ? "z-10" : ""}`}>
            <label className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.15em] uppercase text-white/45 mb-1.5">
              <CalendarDays size={12} /> Check-out
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={18} />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                onFocus={() => setFocusedField("checkout")}
                onBlur={() => setFocusedField(null)}
                className="bg-transparent text-white text-sm w-full pl-10 pr-4 py-3 outline-none"
                min={checkIn || new Date().toISOString().split("T")[0]}
                disabled={!checkIn}
                aria-label="Check-out date"
              />
            </div>
            {checkOut && (
              <p className="mt-2 text-xs text-white/50">Check-out: {formatDate(checkOut)}</p>
            )}
            {!checkIn && checkOut && (
              <p className="mt-2 text-xs text-white/50">Select check-in first</p>
            )}
          </div>

          <div className={`flex-1 md:px-4 relative ${focusedField === "guests" ? "z-10" : ""}`}>
            <label className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.15em] uppercase text-white/45 mb-1.5">
              <Users size={12} /> Guests
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={18} />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                onFocus={() => setFocusedField("guests")}
                onBlur={() => setFocusedField(null)}
                className="bg-transparent text-white text-sm w-full pl-10 pr-10 py-3 outline-none appearance-none"
                style={{ colorScheme: "dark" }}
                aria-label="Number of guests"
              >
                {[1, 2].map((n) => (
                  <option key={n} value={n} className="text-ink">
                    {n} guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheck}
            className="md:pl-4 px-6 py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90 whitespace-nowrap flex items-center justify-center gap-2 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526", boxShadow: "0 4px 20px rgba(184,147,90,0.3)" }}
          >
            <span className="relative z-10">Check Availability</span>
            <ArrowRight size={16} className="relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-1.5 text-white/45 text-xs">
            <ShieldCheck size={13} style={{ color: "#B8935A" }} />
            <span>Guaranteed best rate when you book direct</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-white/30 text-xs">
            <span className="w-px h-4 bg-white/10" />
          </div>
          <div className="flex items-center gap-1.5 text-white/45 text-xs">
            <span className="text-[#D4B483] font-medium">50% deposit</span>
            <span>to secure your stay</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-white/30 text-xs">
            <span className="w-px h-4 bg-white/10" />
          </div>
          <div className="flex items-center gap-1.5 text-white/45 text-xs">
            <span className="text-[#D4B483] font-medium">No platform fees</span>
          </div>
        </div>
      </div>
    </section>
  );
}