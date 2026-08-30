"use client";

import { Check, MessageCircle } from "lucide-react";
import { HostProfile } from "@/lib/types";

interface PricingProps {
  host: HostProfile;
}

export default function Pricing({ host }: PricingProps) {
  const plans = [
    {
      name: "Weekday",
      sub: "Sunday – Thursday",
      rate: host.nightlyRate.weekday,
      features: ["Fully furnished 1BR suite", "High-speed WiFi & Smart TV", "Secure parking", "Self check-in"],
    },
    {
      name: "Weekend",
      sub: "Friday – Saturday",
      rate: host.nightlyRate.weekend,
      features: ["Fully furnished 1BR suite", "High-speed WiFi & Smart TV", "Secure parking", "Self check-in"],
    },
  ];

  const waLink = (message: string) =>
    `https://wa.me/${host.whatsappNumber}?text=${encodeURIComponent(message)}`;

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

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-sm p-7 flex flex-col border"
              style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(184,147,90,0.25)" }}
            >
              <span className="eyebrow" style={{ color: "#8F7143" }}>{plan.sub}</span>
              <h3 className="mt-2 text-xl font-serif mb-1" style={{ color: "#0B1526" }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-serif" style={{ color: "#0B1526" }}>
                  KES {plan.rate.toLocaleString()}
                </span>
                <span className="text-sm" style={{ color: "#8C8577" }}>/ night</span>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: "#5B564B" }}>
                    <Check size={14} style={{ color: "#B8935A", flexShrink: 0 }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={waLink(`Hi, I'd like to book ${host.name} at the ${plan.name.toLowerCase()} rate (KES ${plan.rate.toLocaleString()}/night).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
              >
                <MessageCircle size={15} />
                Book on WhatsApp
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
