"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarCheck, ClipboardCheck, Smartphone } from "lucide-react";
import { waLink } from "@/lib/siteConfig";

const steps = [
  { n: "01", icon: CalendarCheck, title: "Choose your dates", desc: "Pick check-in and check-out above — we confirm availability directly." },
  { n: "02", icon: ClipboardCheck, title: "Review & confirm", desc: "We send the total, house rules, and access details on WhatsApp." },
  { n: "03", icon: Smartphone, title: "Pay your deposit", desc: "50% via M-Pesa secures the booking. Balance on arrival." },
];

export default function SpaceBooking() {
  const [sending, setSending] = useState(false);

  const startBooking = () => {
    setSending(true);
    window.open(
      waLink("Hi, I'd like to start a direct booking at Serenity Suites Nairobi. Please send me the availability calendar."),
      "_blank",
      "noopener,noreferrer"
    );
    setTimeout(() => setSending(false), 600);
  };

  return (
    <section id="book" className="section-pad" style={{ backgroundColor: "#F6F1E6" }}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
        <div>
          <span className="eyebrow" style={{ color: "#8F7143" }}>The Space</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif mb-5 leading-tight" style={{ color: "#0B1526" }}>
            Thoughtfully kept,
            <br />
            quietly styled.
          </h2>
          <p className="max-w-md leading-relaxed mb-6" style={{ color: "#5B564B" }}>
            One bedroom, dressed in the same cobalt and warm-wood palette
            throughout — a fitted kitchenette, a proper bed, and enough
            stillness to actually unwind in.
          </p>
          <a href="#gallery" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide" style={{ color: "#8F7143" }}>
            EXPLORE PHOTOS <ArrowRight size={15} />
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

        <div className="rounded-sm p-7 md:p-9" style={{ backgroundColor: "#0B1526", border: "1px solid rgba(184,147,90,0.2)" }}>
          <span className="eyebrow">Book Direct</span>
          <h3 className="mt-3 text-2xl md:text-3xl font-serif text-white mb-7 leading-tight">
            Simple. Secure.
            <br />
            Seamless.
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

          <button
            onClick={startBooking}
            className="w-full py-3.5 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
          >
            {sending ? "Opening WhatsApp…" : "Start Booking"}
          </button>
          <p className="text-white/30 text-xs text-center mt-4">
            Rates from KES 3,500/night · M-Pesa deposit secures your stay
          </p>
        </div>
      </div>
    </section>
  );
}
