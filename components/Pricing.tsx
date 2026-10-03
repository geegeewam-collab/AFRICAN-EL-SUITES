"use client";

import { Check, MessageCircle, Calculator, Star } from "lucide-react";
import { HostProfile } from "@/lib/types";
import { quote, PRICING_CONFIG } from "@/lib/pricing";

interface PricingProps {
  host: HostProfile;
}

export default function Pricing({ host }: PricingProps) {
  // Sample dates for demonstration (next Friday to Sunday)
  const getSampleDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    return {
      checkIn: friday.toISOString().slice(0, 10),
      checkOut: sunday.toISOString().slice(0, 10),
    };
  };

  const sampleDates = getSampleDates();
  const sampleQuote = quote(sampleDates.checkIn, sampleDates.checkOut);

  const waLink = (message: string) =>
    `https://wa.me/${host.whatsappNumber}?text=${encodeURIComponent(message)}`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  };

  return (
    <section id="pricing" className="section-pad" style={{ backgroundColor: "#F6F1E6" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="eyebrow" style={{ color: "#8F7143" }}>Rates</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif mb-4" style={{ color: "#0B1526" }}>
            Simple, direct pricing
          </h2>
          <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: "#5B564B" }}>
            No booking fees, no surprise charges — just the nightly rate. 50%
            deposit via M-Pesa secures your stay, balance on arrival.
          </p>
        </div>

        {/* Rate Cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {[
            {
              name: "Weekday",
              sub: "Sunday – Thursday",
              rate: PRICING_CONFIG.weekdayRate,
              features: ["Fully furnished 1BR suite", "High-speed WiFi & Smart TV", "Secure parking", "Self check-in"],
              color: "#D4B483",
              bgColor: "rgba(212,180,131,0.1)",
            },
            {
              name: "Weekend",
              sub: "Friday – Saturday",
              rate: PRICING_CONFIG.weekendRate,
              features: ["Fully furnished 1BR suite", "High-speed WiFi & Smart TV", "Secure parking", "Self check-in"],
              color: "#B8935A",
              bgColor: "rgba(184,147,90,0.1)",
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-sm p-7 flex flex-col border overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(184,147,90,0.25)" }}
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: plan.color }} />

              <span className="eyebrow relative" style={{ color: "#8F7143" }}>{plan.sub}</span>
              <h3 className="mt-2 text-xl font-serif mb-1 relative" style={{ color: "#0B1526" }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-serif relative" style={{ color: "#0B1526" }}>
                  KES {plan.rate.toLocaleString()}
                </span>
                <span className="text-sm relative" style={{ color: "#8C8577" }}>/ night</span>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm relative" style={{ color: "#5B564B" }}>
                    <Check size={14} style={{ color: plan.color, flexShrink: 0 }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={waLink(`Hi, I'd like to book ${host.name} at the ${plan.name.toLowerCase()} rate (KES ${plan.rate.toLocaleString()}/night).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
              >
                <MessageCircle size={15} />
                Book on WhatsApp
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              </a>
            </div>
          ))}
        </div>

        {/* Price Breakdown Example */}
        {sampleQuote && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-sm p-6 md:p-8 relative overflow-hidden" style={{ background: "#0B1526", border: "1px solid rgba(184,147,90,0.2)" }}>
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#B8935A]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex items-center gap-2 text-sm font-medium mb-6">
                <Calculator size={16} style={{ color: "#D4B483" }} />
                <span className="eyebrow">Example Stay Breakdown</span>
              </div>
              <p className="text-sm text-stone mb-6 relative">Sample stay: <strong className="text-white">{formatDate(sampleDates.checkIn)} – {formatDate(sampleDates.checkOut)}</strong> ({sampleQuote.nights} nights)</p>

              <div className="space-y-3 relative">
                {sampleQuote.weekdayNights > 0 && (
                  <div className="flex items-center justify-between text-sm p-3 rounded-sm transition-colors" style={{ background: "rgba(212,180,131,0.08)", border: "1px solid rgba(212,180,131,0.15)" }}>
                    <div className="flex items-center gap-3 text-stone">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(212,180,131,0.2)" }}>
                        <span className="text-[10px] font-medium" style={{ color: "#D4B483" }}>Mo–Th</span>
                      </div>
                      <span>{sampleQuote.weekdayNights} night{sampleQuote.weekdayNights > 1 ? "s" : ""} × KES {PRICING_CONFIG.weekdayRate.toLocaleString()}</span>
                    </div>
                    <span className="font-medium" style={{ color: "#D4B483" }}>KES {(sampleQuote.weekdayNights * PRICING_CONFIG.weekdayRate).toLocaleString()}</span>
                  </div>
                )}
                {sampleQuote.weekendNights > 0 && (
                  <div className="flex items-center justify-between text-sm p-3 rounded-sm transition-colors" style={{ background: "rgba(184,147,90,0.08)", border: "1px solid rgba(184,147,90,0.15)" }}>
                    <div className="flex items-center gap-3 text-stone">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(184,147,90,0.2)" }}>
                        <span className="text-[10px] font-medium" style={{ color: "#B8935A" }}>Fr–Sa</span>
                      </div>
                      <span>{sampleQuote.weekendNights} night{sampleQuote.weekendNights > 1 ? "s" : ""} × KES {PRICING_CONFIG.weekendRate.toLocaleString()}</span>
                    </div>
                    <span className="font-medium" style={{ color: "#B8935A" }}>KES {(sampleQuote.weekendNights * PRICING_CONFIG.weekendRate).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-white font-serif" style={{ color: "#0B1526", background: "rgba(255,255,255,0.03)", margin: "0 -1rem", padding: "1rem" }}>
                  <span>Total ({sampleQuote.nights} night{sampleQuote.nights > 1 ? "s" : ""})</span>
                  <span className="text-xl" style={{ color: "#D4B483" }}>KES {sampleQuote.total.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-sm text-center" style={{ background: "rgba(184,147,90,0.1)", border: "1px solid rgba(184,147,90,0.2)" }}>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Deposit (50%)</p>
                    <p className="text-lg font-serif" style={{ color: "#D4B483" }}>KES {sampleQuote.deposit.toLocaleString()}</p>
                    <p className="text-white/40 text-xs mt-1">Pay now via M-Pesa</p>
                  </div>
                  <div className="p-3 rounded-sm text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Balance on Arrival</p>
                    <p className="text-lg font-serif" style={{ color: "#D4B483" }}>KES {sampleQuote.balance.toLocaleString()}</p>
                    <p className="text-white/40 text-xs mt-1">Cash or M-Pesa</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone mt-5 text-center relative">Your exact total is calculated from your selected dates in the booking form.</p>
            </div>
          </div>
        )}

        {/* What's Included */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="eyebrow" style={{ color: "#8F7143" }}>Included</span>
            <h3 className="mt-2 text-2xl md:text-3xl font-serif" style={{ color: "#0B1526" }}>
              Everything you need for a perfect stay
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🛏️", label: "Luxury bedding", desc: "Hotel-quality linens" },
              { icon: "📶", label: "High-speed WiFi", desc: "Fibre broadband" },
              { icon: "📺", label: "Smart TV", desc: "Netflix & YouTube" },
              { icon: "🚗", label: "Secure parking", desc: "On-site & gated" },
              { icon: "🔑", label: "Self check-in", desc: "Keyless entry" },
              { icon: "🍳", label: "Full kitchenette", desc: "Cook your meals" },
              { icon: "🛁", label: "Hot shower", desc: "Instant hot water" },
              { icon: "⚡", label: "Backup power", desc: "Generator ready" },
            ].map((item, i) => (
              <div key={i} className="group p-4 rounded-sm transition-all duration-300 hover:-translate-y-0.5" style={{ background: "#FFFFFF", border: "1px solid rgba(184,147,90,0.15)" }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-sm font-medium mb-1" style={{ color: "#0B1526" }}>{item.label}</h4>
                <p className="text-xs" style={{ color: "#8C8577" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}