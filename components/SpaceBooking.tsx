"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarCheck, ClipboardCheck, Smartphone, Users, CreditCard } from "lucide-react";
import { HostProfile } from "@/lib/types";

interface SpaceBookingProps {
  host: HostProfile;
}

const steps = [
  { n: "01", icon: CalendarCheck, title: "Request your dates", desc: "Enter your preferred stay dates — we confirm availability instantly." },
  { n: "02", icon: ClipboardCheck, title: "Secure Deposit", desc: "Pay a 50% deposit via STK Push to lock in your dates." },
  { n: "03", icon: Smartphone, title: "Final Confirmation", desc: "Receive house rules and access details via WhatsApp." },
];

export default function SpaceBooking({ host }: SpaceBookingProps) {
  const [sending, setSending] = useState(false);
  const [dates, setDates] = useState({ checkin: "", checkout: "" });
  const [guests, setGuests] = useState("1");
  const [guestInfo, setGuestInfo] = useState({ name: "", phone: "" });

  const waLink = (message: string) =>
    `https://wa.me/${host.whatsappNumber}?text=${encodeURIComponent(message)}`;

  const startBooking = async () => {
    if (!guestInfo.name || !guestInfo.phone) {
      alert("Please enter your name and phone number to continue.");
      return;
    }

    setSending(true);

    try {
      // 1. Call the Payment API to trigger STK Push
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: host.id,
          guestName: guestInfo.name,
          guestPhone: guestInfo.phone,
          checkIn: dates.checkin,
          checkOut: dates.checkout,
          guests: guests,
          totalAmount: host.nightlyRate.weekday, // Simplified for now
          depositAmount: host.nightlyRate.weekday / 2,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 2. If payment is triggered, send them to WhatsApp for the confirmation
        const message = `Hi! I've just triggered the deposit for my stay at ${host.name}.

👤 Name: ${guestInfo.name}
📅 Dates: ${dates.checkin || "TBD"} to ${dates.checkout || "TBD"}
👥 Guests: ${guests}

Please confirm receipt of payment and send me the house rules!`;

        window.open(waLink(message), "_blank", "noopener,noreferrer");
      } else {
        alert(`Payment Error: ${result.error}`);
      }
    } catch (error) {
      alert("An error occurred while processing your booking. Please try again.");
    } finally {
      setSending(false);
    }
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
            {host.description}
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

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-3">
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

            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-[10px] uppercase tracking-widest ml-1">Guest Details</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Full Name"
                  className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm focus:outline-none focus:border-[#B8935A]"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                />
                <input
                  placeholder="Phone (e.g. 254...)"
                  className="bg-white/5 border border-white/10 rounded-sm p-2 text-white text-sm focus:outline-none focus:border-[#B8935A]"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
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
          </div>

          <button
            onClick={startBooking}
            disabled={sending}
            className="w-full py-4 text-sm font-medium rounded-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #B8935A, #D4B483)",
              color: "#0B1526",
              opacity: sending ? 0.7 : 1
            }}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0B1526]/30 border-t-[#0B1526] rounded-full animate-spin" />
                Processing Deposit...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Confirm & Pay Deposit
              </>
            )}
          </button>
          <p className="text-white/30 text-xs text-center mt-4">
            Deposit of KES {(host.nightlyRate.weekday / 2).toLocaleString()} secures your stay
          </p>
        </div>
      </div>
    </section>
  );
}
