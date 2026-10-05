import { Check, MessageCircle, Calculator } from "lucide-react";
import { HostProfile } from "@/lib/types";
import { quote, PRICING_CONFIG } from "@/lib/pricing";
import { addDays, parse, todayNairobi } from "@/lib/dates";

interface PricingProps {
  host: HostProfile;
}

export default function Pricing({ host }: PricingProps) {
  // Example stay: the coming Friday to Sunday (computed in Nairobi time; the page refreshes hourly)
  const getSampleDates = () => {
    const today = todayNairobi();
    const dow = new Date(parse(today)).getUTCDay();
    const toFriday = (5 - dow + 7) % 7 || 7;
    const checkIn = addDays(today, toFriday);
    return { checkIn, checkOut: addDays(checkIn, 2) };
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
                href="#book"
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium rounded-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
              >
                Check dates &amp; book
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-sm -mt-10 mb-16" style={{ color: "#5B564B" }}>
          Questions first?{" "}
          <a href={waLink(`Hi! I have a question about ${host.name}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2" style={{ color: "#8F7143" }}>
            <MessageCircle size={13} /> Ask us on WhatsApp
          </a>
        </p>

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
              <p className="text-sm text-stone mb-6 relative">Sample stay: <strong className="text-white">{formatDate(sampleDates.checkIn)} – {formatDate(sampleDates.checkOut)}</strong> ({sampleQuote.nights} night{sampleQuote.nights > 1 ? "s" : ""})</p>

              <div className="space-y-3 relative">
                {sampleQuote.weekdayNights > 0 && (
                  <div className="flex items-center justify-between text-sm p-3 rounded-sm transition-colors" style={{ background: "rgba(212,180,131,0.08)", border: "1px solid rgba(212,180,131,0.15)" }}>
                    <div className="flex items-center gap-3 text-stone">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(212,180,131,0.2)" }}>
                        <span className="text-[10px] font-medium" style={{ color: "#D4B483" }}>Su–Th</span>
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
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-1 px-1">
                  <span className="text-white font-serif">Total ({sampleQuote.nights} night{sampleQuote.nights > 1 ? "s" : ""})</span>
                  <span className="text-xl font-serif" style={{ color: "#D4B483" }}>KES {sampleQuote.total.toLocaleString()}</span>
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

      </div>
    </section>
  );
}