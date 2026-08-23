"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, Users, ShieldCheck } from "lucide-react";
import { waLink } from "@/lib/siteConfig";

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const handleCheck = () => {
    const dates =
      checkIn && checkOut
        ? `${checkIn} to ${checkOut}`
        : checkIn
        ? `checking in ${checkIn}`
        : "dates I'll confirm";
    const message = `Hi, I'd like to check availability at Serenity Suites Nairobi for ${dates}, ${guests} guest(s).`;
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative min-h-[720px] flex items-end overflow-hidden pt-28 pb-40 md:pb-48">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/living-room-tv.jpg"
          alt="Living room at Serenity Suites Nairobi with cobalt curtains and TV lounge"
          fill
          priority
          className="object-cover object-[center_30%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,21,38,0.55) 0%, rgba(11,21,38,0.35) 40%, rgba(11,21,38,0.92) 100%)",
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
        <div className="max-w-xl">
          <span className="eyebrow">South B · Nairobi · Kenya</span>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.08] mb-5">
            Your quiet address in South B.
          </h1>
          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-2 max-w-md">
            A fully furnished suite ten minutes from JKIA — styled for real rest,
            whether you're between flights or between meetings.
          </p>
        </div>

        <div
          className="mt-8 rounded-sm p-4 md:p-5 flex flex-col md:flex-row gap-3 md:gap-0 md:items-end w-full md:max-w-2xl"
          style={{ background: "rgba(15,26,46,0.92)", border: "1px solid rgba(184,147,90,0.25)", backdropFilter: "blur(6px)" }}
        >
          <div className="flex-1 md:border-r border-white/10 md:pr-4">
            <label className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.15em] uppercase text-white/45 mb-1.5">
              <CalendarDays size={12} /> Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent text-white text-sm w-full outline-none"
            />
          </div>
          <div className="flex-1 md:border-r border-white/10 md:px-4">
            <label className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.15em] uppercase text-white/45 mb-1.5">
              <CalendarDays size={12} /> Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-white text-sm w-full outline-none"
            />
          </div>
          <div className="flex-1 md:border-r border-white/10 md:px-4">
            <label className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.15em] uppercase text-white/45 mb-1.5">
              <Users size={12} /> Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="bg-transparent text-white text-sm w-full outline-none"
              style={{ colorScheme: "dark" }}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n} className="text-ink">
                  {n} guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCheck}
            className="md:pl-4 px-6 py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
          >
            Check Availability
          </button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-white/45 text-xs">
          <ShieldCheck size={13} /> No booking fees · Best rate when you book direct
        </p>
      </div>
    </section>
  );
}
