"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarCheck, ClipboardCheck, Smartphone, Users, CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { HostProfile } from "@/lib/types";
import { quote } from "@/lib/pricing";
import { Range } from "@/lib/dates";
import AvailabilityCalendar from "./AvailabilityCalendar";

interface SpaceBookingProps {
  host: HostProfile;
}

const steps = [
  { n: "01", icon: CalendarCheck, title: "Choose dates", desc: "Select your check-in and check-out dates on the calendar." },
  { n: "02", icon: ClipboardCheck, title: "Pay deposit", desc: "Secure your stay with a 50% deposit via M-Pesa STK Push." },
  { n: "03", icon: Smartphone, title: "Get confirmed", desc: "Receive house rules and access details via WhatsApp." },
];

type BookingState = "idle" | "loading" | "success" | "error";

export default function SpaceBooking({ host }: SpaceBookingProps) {
  const [bookingState, setBookingState] = useState<BookingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<{
    bookingId: string;
    deposit: number;
    totalAmount: number;
    balanceAmount: number;
    weekdayNights: number;
    weekendNights: number;
  } | null>(null);
  const [ranges, setRanges] = useState<Range[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadRanges = useCallback(() => {
    fetch("/api/availability", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRanges(j.ranges ?? []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadRanges();
    setMounted(true);
  }, [loadRanges]);

  const [dates, setDates] = useState({ checkin: "", checkout: "" });
  const [guests, setGuests] = useState("1");
  const [guestInfo, setGuestInfo] = useState({ name: "", phone: "" });

  // Read dates from sessionStorage (set by Hero section)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const heroCheckIn = sessionStorage.getItem("hero_checkin");
      const heroCheckOut = sessionStorage.getItem("hero_checkout");
      const heroGuests = sessionStorage.getItem("hero_guests");

      if (heroCheckIn && heroCheckOut) {
        setDates({ checkin: heroCheckIn, checkout: heroCheckOut });
        sessionStorage.removeItem("hero_checkin");
        sessionStorage.removeItem("hero_checkout");
      }
      if (heroGuests) {
        setGuests(heroGuests);
        sessionStorage.removeItem("hero_guests");
      }
    }
  }, []);

  const q = quote(dates.checkin, dates.checkout);

  const waLink = (message: string) =>
    `https://wa.me/${host.whatsappNumber}?text=${encodeURIComponent(message)}`;

  const confirmLink = waLink(`Hi! I've just paid my M-Pesa deposit for my stay at ${host.name}.

👤 Name: ${guestInfo.name}
📅 Dates: ${dates.checkin} to ${dates.checkout}
👥 Guests: ${guests}

Please confirm and send me the house rules!`);

  const startBooking = async () => {
    if (!guestInfo.name?.trim() || !guestInfo.phone?.trim()) {
      setErrorMessage("Please enter your name and phone number to continue.");
      setBookingState("error");
      return;
    }

    if (!q) {
      setErrorMessage("Please choose valid check-in and check-out dates.");
      setBookingState("error");
      return;
    }

    setBookingState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guestInfo.name.trim(),
          guestPhone: guestInfo.phone.trim(),
          checkIn: dates.checkin,
          checkOut: dates.checkout,
          guests: parseInt(guests, 10),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBookingData({
          bookingId: result.bookingId,
          deposit: result.deposit,
          totalAmount: q.total,
          balanceAmount: q.balance,
          weekdayNights: q.weekdayNights,
          weekendNights: q.weekendNights,
        });
        setBookingState("success");
      } else {
        setErrorMessage(result.error || "Something went wrong. Please try again.");
        setBookingState("error");
        if (/taken/i.test(result.error ?? "")) {
          loadRanges();
          setDates({ checkin: "", checkout: "" });
        }
      }
    } catch {
      setErrorMessage("Unable to process booking. Please check your connection and try again.");
      setBookingState("error");
    }
  };

  const dismissError = () => {
    setErrorMessage(null);
    setBookingState("idle");
  };

  const retryBooking = () => {
    setBookingState("idle");
    setErrorMessage(null);
  };

  if (!mounted) {
    return (
      <section id="book" className="section-pad" style={{ backgroundColor: "#F6F1E6" }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <span className="eyebrow" style={{ color: "#8F7143" }}>The Space</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif mb-5 leading-tight" style={{ color: "#0B1526" }}>
              A sanctuary of <br /> stillness and style.
            </h2>
            <p className="max-w-md leading-relaxed mb-6" style={{ color: "#5B564B" }}>{host.description}</p>
            <div className="grid grid-cols-2 gap-2.5 mt-8">
              <div className="relative rounded-sm overflow-hidden row-span-2" style={{ aspectRatio: "3/4" }}>
                <Image src={host.gallery[0].src} alt={host.gallery[0].alt} fill className="object-cover" sizes="30vw" />
              </div>
              <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <Image src={host.gallery[1].src} alt={host.gallery[1].alt} fill className="object-cover" sizes="30vw" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1/1" }}>
                  <Image src={host.gallery[2].src} alt={host.gallery[2].alt} fill className="object-cover" sizes="15vw" />
                </div>
                <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1/1" }}>
                  <Image src={host.gallery[3].src} alt={host.gallery[3].alt} fill className="object-cover" sizes="15vw" />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-sm p-7 md:p-9 shadow-xl" style={{ backgroundColor: "#0B1526", border: "1px solid rgba(184,147,90,0.2)" }}>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#B8935A] animate-spin" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="section-pad" style={{ backgroundColor: "#F6F1E6" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
        {/* Left: Gallery + Description */}
        <div className="animate-in fade-in slide-in-from-left duration-1000">
          <span className="eyebrow" style={{ color: "#8F7143" }}>The Space</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif mb-5 leading-tight" style={{ color: "#0B1526" }}>
            A sanctuary of <br /> stillness and style.
          </h2>
          <p className="max-w-md leading-relaxed mb-6" style={{ color: "#5B564B" }}>{host.description}</p>
          <a href="#gallery" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide" style={{ color: "#8F7143" }}>
            EXPLORE THE AESTHETIC <ArrowRight size={15} />
          </a>

          <div className="grid grid-cols-2 gap-2.5 mt-8">
            <div className="relative rounded-sm overflow-hidden row-span-2" style={{ aspectRatio: "3/4" }}>
              <Image src={host.gallery[0].src} alt={host.gallery[0].alt} fill className="object-cover" sizes="30vw" />
            </div>
            <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <Image src={host.gallery[1].src} alt={host.gallery[1].alt} fill className="object-cover" sizes="30vw" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <Image src={host.gallery[2].src} alt={host.gallery[2].alt} fill className="object-cover" sizes="15vw" />
              </div>
              <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <Image src={host.gallery[3].src} alt={host.gallery[3].alt} fill className="object-cover" sizes="15vw" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="relative">
          <div className="rounded-sm shadow-xl" style={{ backgroundColor: "#0B1526", border: "1px solid rgba(184,147,90,0.2)" }}>
            <div className="p-7 md:p-9">
              {/* Header */}
              <div className="mb-8">
                <span className="eyebrow">Direct Booking</span>
                <h3 className="mt-3 text-2xl md:text-3xl font-serif text-white mb-2 leading-tight">
                  Seamless. Secure. <br /> Exclusively Yours.
                </h3>
                <p className="text-white/45 text-sm">Book direct for the best rate — no platform fees.</p>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-5 mb-8">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = bookingState === "loading" && step.n === "02";
                  const isDone = bookingState === "success" && (step.n === "01" || step.n === "02");
                  return (
                    <div key={step.n} className={`flex gap-4 items-start transition-colors ${isActive ? "animate-pulse" : ""}`}>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-serif transition-all ${
                          isDone ? "bg-[#B8935A] text-[#0B1526]" :
                          isActive ? "bg-[#B8935A]/30 text-[#D4B483] border-[#B8935A]/50" :
                          "bg-white/5 border-white/10 text-white/50"
                        }`}
                        style={{
                          border: "1px solid",
                          borderColor: isDone ? "#B8935A" : isActive ? "rgba(184,147,90,0.5)" : "rgba(255,255,255,0.1)"
                        }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : step.n}
                      </div>
                      <div>
                        <p className={`text-sm font-medium mb-0.5 ${isActive ? "text-[#D4B483]" : isDone ? "text-[#D4B483]" : "text-white"}`}>
                          {step.title}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: isActive ? "#D4B483" : isDone ? "#D4B483" : "rgba(255,255,255,0.4)" }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error State */}
              {bookingState === "error" && errorMessage && (
                <div className="mb-6 p-4 rounded-sm flex items-start gap-3 animate-in fade-in" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <AlertCircle size={20} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-300">Unable to proceed</p>
                    <p className="text-white/80 text-sm mt-0.5">{errorMessage}</p>
                  </div>
                  <button onClick={dismissError} className="text-white/50 hover:text-white text-xl leading-none p-1" aria-label="Dismiss error">×</button>
                </div>
              )}

              {/* Success State */}
              {bookingState === "success" && bookingData && (
                <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#B8935A]/15 border border-[#B8935A]/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={28} style={{ color: "#D4B483" }} />
                  </div>
                  <h4 className="text-white font-serif text-2xl mb-2">Deposit Initiated</h4>
                  <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                    We've sent an M-Pesa STK Push to your phone. Enter your PIN to pay the
                    <strong className="text-white">KES {bookingData.deposit.toLocaleString()}</strong> deposit.
                  </p>
                  <a
                    href={confirmLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90 shadow-lg"
                    style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
                  >
                    <Smartphone size={18} />
                    Confirm on WhatsApp
                  </a>
                  <p className="mt-4 text-white/60 text-sm">
                    Once paid, tap above to receive your house rules and access details.
                  </p>
                  <button
                    onClick={() => { setBookingState("idle"); setBookingData(null); }}
                    className="mt-6 text-white/40 hover:text-white text-sm underline"
                  >
                    Payment didn&apos;t come through? Try different dates
                  </button>
                </div>
              )}

              {/* Booking Form - only show when not in success state */}
              {bookingState !== "success" && (
                <>
                  {/* Calendar */}
                  <div className="mb-6">
                    <AvailabilityCalendar
                      ranges={ranges}
                      checkIn={dates.checkin}
                      checkOut={dates.checkout}
                      onChange={(ci, co) => {
                        setDates({ checkin: ci, checkout: co });
                        if (bookingState === "error") setBookingState("idle");
                      }}
                    />
                  </div>

                  {/* Guest Details */}
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest">
                      <Users size={12} style={{ color: "#B8935A" }} />
                      Guest Details
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="w-full bg-white/5 border border-white/10 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-[#B8935A] focus:ring-1 focus:ring-[#B8935A] transition-all peer"
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                          onFocus={() => bookingState === "error" && setBookingState("idle")}
                          disabled={bookingState === "loading"}
                          aria-label="Full name"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="Phone (e.g. 2547...)"
                          className="w-full bg-white/5 border border-white/10 rounded-sm p-3 text-white text-sm focus:outline-none focus:border-[#B8935A] focus:ring-1 focus:ring-[#B8935A] transition-all peer"
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                          onFocus={() => bookingState === "error" && setBookingState("idle")}
                          disabled={bookingState === "loading"}
                          aria-label="Phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest mb-3">
                      <Users size={12} style={{ color: "#B8935A" }} />
                      Guests
                    </label>
                    <div className="flex gap-2">
                      {["1", "2"].map((num) => (
                        <button
                          key={num}
                          onClick={() => setGuests(num)}
                          disabled={bookingState === "loading"}
                          className={`flex-1 py-3 text-sm rounded-sm transition-all font-medium ${
                            guests === num
                              ? "bg-[#B8935A] text-[#0B1526] shadow-md"
                              : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                          }`}
                          aria-pressed={guests === num}
                        >
                          {num} Guest{num !== "1" ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  {q && (
                    <div className="mb-6 p-5 rounded-sm relative overflow-hidden animate-in slide-in-from-bottom duration-300"
                         style={{ background: "linear-gradient(135deg, rgba(184,147,90,0.12) 0%, rgba(184,147,90,0.04) 100%)", border: "1px solid rgba(184,147,90,0.25)" }}>
                      <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest mb-4">
                        <span style={{ color: "#B8935A" }}>Price Breakdown</span>
                        <span className="w-px h-4 bg-white/10 mx-2" />
                        <span className="text-white/60 text-sm font-medium">{q.nights} night{q.nights > 1 ? "s" : ""}</span>
                      </div>
                      <div className="space-y-3">
                        {q.weekdayNights > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-white/80">
                              <span className="w-2 h-2 rounded-full" style={{ background: "#D4B483" }} />
                              <span>{q.weekdayNights} weekday night{q.weekdayNights > 1 ? "s" : ""}</span>
                            </div>
                            <span className="font-medium text-white" style={{ color: "#D4B483" }}>
                              KES {(q.weekdayNights * host.nightlyRate.weekday).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {q.weekendNights > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-white/80">
                              <span className="w-2 h-2 rounded-full" style={{ background: "#B8935A" }} />
                              <span>{q.weekendNights} weekend night{q.weekendNights > 1 ? "s" : ""}</span>
                            </div>
                            <span className="font-medium text-white" style={{ color: "#D4B483" }}>
                              KES {(q.weekendNights * host.nightlyRate.weekend).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-white font-medium">Total</span>
                          <span className="text-lg font-serif" style={{ color: "#D4B483" }}>KES {q.total.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="p-3 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Deposit (50%)</p>
                            <p className="text-lg font-serif" style={{ color: "#D4B483" }}>KES {q.deposit.toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Balance on Arrival</p>
                            <p className="text-lg font-serif" style={{ color: "#D4B483" }}>KES {q.balance.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={startBooking}
                    disabled={bookingState === "loading" || !q || !guestInfo.name?.trim() || !guestInfo.phone?.trim()}
                    className="w-full py-4 md:py-5 text-sm md:text-base font-medium rounded-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-xl flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #B8935A 0%, #D4B483 50%, #8F7143 100%)",
                      color: "#0B1526",
                      opacity: bookingState === "loading" || !q || !guestInfo.name?.trim() || !guestInfo.phone?.trim() ? 0.5 : 1,
                    }}
                    aria-busy={bookingState === "loading"}
                  >
                    {bookingState === "loading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Deposit...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>Confirm & Pay Deposit</span>
                      </>
                    )}
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" style={{ opacity: bookingState === "loading" ? 0 : 1 }} />
                  </button>

                  <p className="text-white/30 text-xs text-center mt-4">
                    {q
                      ? `KES ${q.total.toLocaleString()} for ${q.nights} night${q.nights > 1 ? "s" : ""} · deposit KES ${q.deposit.toLocaleString()} secures your stay`
                      : "Select dates to see your total and deposit"}
                  </p>

                  {/* Trust indicators */}
                  <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-white/40">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} style={{ color: "#B8935A" }} />
                      <span>Secure M-Pesa payment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} style={{ color: "#B8935A" }} />
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} style={{ color: "#B8935A" }} />
                      <span>Best rate guaranteed</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}