"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CalendarDays, Users, ShieldCheck, ArrowRight, CalendarCheck } from "lucide-react";
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
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  };

  const handleCheckAvailability = () => {
    // If dates selected, scroll to booking section and pre-fill
    if (checkIn && checkOut) {
      // Store dates in sessionStorage for the booking section to pick up
      sessionStorage.setItem("hero_checkin", checkIn);
      sessionStorage.setItem("hero_checkout", checkOut);
      sessionStorage.setItem("hero_guests", guests);

      // Scroll to booking section
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        // Focus the calendar after scroll
        setTimeout(() => {
          bookingSectionRef.current?.focus();
        }, 500);
      } else {
        // Fallback: navigate to #book anchor
        window.location.href = "#book";
      }
      return;
    }

    // If no dates, open WhatsApp inquiry
    const url = getBookingInquiryWhatsAppUrl({
      checkIn,
      checkOut,
      guests: parseInt(guests, 10),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleWhatsAppInquiry = () => {
    const url = getBookingInquiryWhatsAppUrl({
      checkIn,
      checkOut,
      guests: parseInt(guests, 10),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative min-h-[720px] flex items-end overflow-hidden pt-28 pb-40 md:pb-48" ref={bookingSectionRef} id="hero">
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

          <div className="flex md:flex-col md:items-stretch gap-2 md:pl-4 w-full">
            <button
              onClick={handleCheckAvailability}
              className="px-6 py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90 whitespace-nowrap flex items-center justify-center gap-2 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526", boxShadow: "0 4px 20px rgba(184,147,90,0.3)" }}
            >
              <CalendarCheck size={16} className="relative z-10" />
              <span className="relative z-10">{checkIn && checkOut ? "Check Availability" : "Check Availability on WhatsApp"}</span>
              <ArrowRight size={16} className="relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
            </button>

            {(checkIn || checkOut) && (
              <button
                onClick={handleWhatsAppInquiry}
                className="px-4 py-2.5 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90 whitespace-nowrap flex items-center justify-center gap-2 border border-white/20"
                style={{ background: "rgba(255,255,255,0.05)", color: "white" }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="#25D366" className="relative z-10">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="relative z-10">Ask on WhatsApp</span>
              </button>
            )}
          </div>
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