"use client";

import {
  Wifi, Tv, Car, Shield, ArrowUpDown, Coffee,
  Utensils, Volume2, Plane, MapPin, Zap, Bath,
} from "lucide-react";

const amenities = [
  { icon: Wifi, label: "High-Speed WiFi", desc: "Fibre broadband" },
  { icon: Tv, label: "Smart TV", desc: "Netflix-ready" },
  { icon: Car, label: "Secure Parking", desc: "On-site parking" },
  { icon: Shield, label: "24/7 Security", desc: "CCTV + guards" },
  { icon: ArrowUpDown, label: "Elevator Access", desc: "4th floor suite" },
  { icon: Coffee, label: "Balcony", desc: "Fresh air & views" },
  { icon: Bath, label: "Hot Shower", desc: "Instant hot water" },
  { icon: Utensils, label: "Full Kitchenette", desc: "Cook your own meals" },
  { icon: Volume2, label: "Quiet Building", desc: "Peaceful & calm" },
  { icon: Plane, label: "10 Min to JKIA", desc: "Airport access" },
  { icon: MapPin, label: "5 Min to CBD", desc: "Central location" },
  { icon: Zap, label: "Backup Power", desc: "Generator ready" },
];

export default function Amenities() {
  return (
    <section id="amenities" className="section-pad" style={{ backgroundColor: "#F6F1E6" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="eyebrow" style={{ color: "#8F7143" }}>Amenities</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif mb-4" style={{ color: "#0B1526" }}>
            Everything you need
          </h2>
          <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: "#5B564B" }}>
            Fully equipped for comfort and a bit of productivity — whether
            you're here for business or just to switch off.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {amenities.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group flex flex-col items-center text-center p-5 rounded-sm border transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,147,90,0.18)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(184,147,90,0.1)", border: "1px solid rgba(184,147,90,0.3)" }}
                >
                  <Icon size={19} style={{ color: "#8F7143" }} />
                </div>
                <h3 className="text-sm font-medium mb-1" style={{ color: "#0B1526" }}>{item.label}</h3>
                <p className="text-xs" style={{ color: "#8C8577" }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
