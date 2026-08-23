"use client";

import { Check } from "lucide-react";
import { waLink } from "@/lib/siteConfig";

const plans = [
  { label: "Weekday", price: "3,500", period: "per night", days: "Mon – Thu", highlight: false,
    features: ["Full apartment access", "WiFi + Smart TV", "Secure parking", "Fresh linen & towels", "24/7 security"],
    message: "Hi, I'd like to book Serenity Suites for a weekday stay." },
  { label: "Weekend", price: "4,000", period: "per night", days: "Fri – Sun", highlight: true, badge: "Most Popular",
    features: ["Full apartment access", "WiFi + Smart TV", "Secure parking", "Fresh linen & towels", "24/7 security"],
    message: "Hi, I'd like to book Serenity Suites for a weekend stay." },
  { label: "Weekly", price: "22,000", period: "per week", days: "7 nights", highlight: false, badge: "Save KES 2,500",
    features: ["Full apartment access", "WiFi + Smart TV", "Secure parking", "Fresh linen & towels", "24/7 security", "Mid-week cleaning"],
    message: "Hi, I'm interested in a weekly stay at Serenity Suites. Please share available dates." },
  { label: "Monthly", price: "75,000", period: "per month", days: "30 nights", highlight: false, badge: "Best Value",
    features: ["Full apartment access", "WiFi + Smart TV", "Secure parking", "Fresh linen & towels", "24/7 security", "Weekly cleaning", "Priority support"],
    message: "Hi, I'm interested in a monthly stay at Serenity Suites. Please share available dates." },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-pad" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="eyebrow">Rates</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif text-white mb-4">Rates & Availability</h2>
          <p className="text-white/45 text-sm max-w-md mx-auto">
            All rates include utilities, WiFi, and parking. 50% deposit via M-Pesa confirms your booking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="relative rounded-sm p-6 flex flex-col border transition-all duration-300 hover:-translate-y-1"
              style={{
                background: plan.highlight
                  ? "linear-gradient(160deg, rgba(184,147,90,0.14) 0%, rgba(11,21,38,0.4) 100%)"
                  : "rgba(255,255,255,0.03)",
                borderColor: plan.highlight ? "#B8935A" : "rgba(255,255,255,0.08)",
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#D4B483" }}>{plan.label}</p>
                <p className="text-white/40 text-xs mb-4">{plan.days}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-white/60 text-sm">KES</span>
                  <span className="text-3xl font-serif font-semibold text-white">{plan.price}</span>
                </div>
                <p className="text-white/40 text-xs mt-1">{plan.period}</p>
              </div>

              <div className="h-px mb-6" style={{ background: "rgba(184,147,90,0.15)" }} />

              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check size={14} style={{ color: "#D4B483", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              
                href={waLink(plan.message)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90"
                style={
                  plan.highlight
                    ? { background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }
                    : { border: "1px solid rgba(184,147,90,0.4)", color: "#D4B483" }
                }
              >
                Book via WhatsApp
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          Prices in Kenyan Shillings (KES) · M-Pesa accepted · Contact us for group or long-term rates
        </p>
      </div>
    </section>
  );
}
