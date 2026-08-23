"use client";

import { Car, Coffee, Clock3, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/siteConfig";

const extras = [
  { icon: Car, title: "Airport Pickup", desc: "Stress-free ride from JKIA straight to the suite.", price: "KES 2,000" },
  { icon: Coffee, title: "Breakfast Stock-Up", desc: "Kitchen stocked with breakfast basics before you arrive.", price: "KES 1,200" },
  { icon: Clock3, title: "Late Checkout", desc: "Keep the suite until 2pm, subject to availability.", price: "KES 1,500" },
];

export default function EnhanceStay() {
  return (
    <section className="section-pad" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow">Enhance Your Stay</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif text-white mb-3">A few good extras</h2>
          <p className="text-white/45 text-sm max-w-md mx-auto">
            Add any of these when you message us to book — no need to ask twice.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {extras.map((extra, i) => {
            const Icon = extra.icon;
            return (
              <div
                key={i}
                className="rounded-sm p-6 flex flex-col border transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(184,147,90,0.18)" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                  style={{ background: "rgba(184,147,90,0.1)", border: "1px solid rgba(184,147,90,0.25)" }}
                >
                  <Icon size={18} style={{ color: "#D4B483" }} />
                </div>
                <h3 className="text-white text-base font-medium mb-1.5">{extra.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5 flex-1">{extra.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-serif" style={{ color: "#D4B483" }}>{extra.price}</span>
                  
                    href={waLink(`Hi, I'd like to add "${extra.title}" (${extra.price}) to my stay at Serenity Suites Nairobi.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
                  >
                    Add <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
