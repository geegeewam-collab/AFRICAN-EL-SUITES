"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarCheck, ClipboardCheck, Smartphone, Users } from "lucide-react";
import { waLink } from "@/lib/siteConfig";

const steps = [
  { n: "01", icon: CalendarCheck, title: "Request your dates", desc: "Enter your preferred stay dates — we confirm availability instantly." },
  { n: "02", icon: ClipboardCheck, title: "Curated Confirmation", desc: "We send the final quote and access details via WhatsApp." },
  { n: "03", icon: Smartphone, title: "Secure your sanctuary", desc: "A 50% M-Pesa deposit secures your booking. Balance on arrival." },
];

export default function SpaceBooking() {
  const [sending, setSending] = useState(false);
  const [dates, setDates] = useState({ checkin: "", checkout: "" });
  const [guests, setGuests] = useState("1");

  const startBooking = () => {
    setSending(true);
    const message = `Hi! I'd like to request a booking at Serenity Suites Nairobi.

📅 Dates: ${dates.checkin || "TBD"} to ${dates.checkout || "TBD"}
👥 Guests: ${guests}

Please let me know if these dates are available!`;

    window.open(
      waLink(message),
      "_blank",
      "noopener,noreferrer"
    );
    setTimeout(() => setSending(false), 600);
  };

  return (
    <section id="book" className="section-pad" style={{ backgroundColor: "#F6F1E6" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
        <div className="animate-in fade-in slide-in-from-left duration-1000">
          <span className="eyebrow" style={{ color: "#8F7143" }}>The Space</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif mb-5 leading-tight" style={{ color: "#0B1526" }}>
            A sanctuary of
            <br />
            stillness and style.
          </h2>
          <p className="max-w-md leading-relaxed mb-6" style={{ color: "#5B564B" }}>
            A refined one-bedroom retreat designed for the discerning traveler.
            Featuring a signature cobalt and warm-wood palette, a fully-equipped
            kitchenette, and an atmosphere of absolute calm.
          </p>
          <a href="#gallery" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide" style={{ color: "#8F7143" }}>
            EXPLORE THE AESTHETIC <ArrowRight size={15} />
          </a>

          <div className="grid grid-cols-2 gap-2.5 mt-8">
            <div className="relative rounded-sm overflow-hidden row-span-2" style={{ aspectRatio: "3/4" }}>
              <Image src="/images/bedroom-suite.jpg" alt="Bedroom suite" fill className="object-cover" sizes="30vw" />
            </div>
            <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <Image src="/images/living-room-lounge.jpg" alt="Lounge area" fill className="object-cover" sizes="30vw" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <Image src="/images/kitchen-bar.jpg" alt="Kitchen bar" fill className="object-cover" sizes="15vw" />
              </div>
              <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <Image src="/images/styling-detail.jpg" alt="Styling detail" fill className="object-cover" sizes="15vw" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm p-7 md:p-9 shadow-xl" style={{ backgroundColor: "#0B1526", border: "1px solid rgba(184,147,90,0.2)" }}>
          <span className="eyebrow">Direct Booking</span>
          <h3 className="mt-3 text-2xl md:text-3xl font-serif text-white mb-7 leading-tight">
            Seamless. Secure.
            <br />
            Exclusively Yours.
          </h3>

          <div className="flex flex-col gap-6 mb-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="flex gap-4 items-start">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-serif"
                    style={{ background: "rgba(184,147,90,0.12)", border: "1px solid rgba(184,147,90,0.35)", color: "#D4B483" }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-0.5">{step.title}</p>
                    <p className="text-white/45 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">Check-in</label>
              <input
                type="date"
                className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm focus:outline-none focus:border-[#B8935A] transition-colors"
                onChange={(e) => setDates({...dates, checkin: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">Check-out</label>
              <input
                type="date"
                className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm focus:outline-none focus:border-[#B8935A] transition-colors"
                onChange={(e) => setDates({...dates, checkout: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-8">
            <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">Number of Guests</label>
            <div className="flex gap-2">
              {[ "1", "2" ].map((num) => (
                <button
                  key={num}
                  onClick={() => setGuests(num)}
                  className={`flex-1 py-2 text-sm rounded-sm transition-all ${guests === num ? 'bg-[#B8935A] text-[#0B1526]' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  {num} Guest{num !== "1" ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startBooking}
            className="w-full py-4 text-sm font-medium rounded-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
          >
            {sending ? "Opening WhatsApp…" : "Request Booking"}
          </button>
          <p className="text-white/30 text-xs text-center mt-4">
            Starting from KES 3,500/night · M-Pesa secures your stay
          </p>
        </div>
      </div>
    </section>
  );
}
