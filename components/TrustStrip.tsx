"use client";

import { MapPin, Car, KeyRound, ShieldCheck } from "lucide-react";
import { HostProfile } from "@/lib/types";

interface TrustStripProps {
  host: HostProfile;
}

const items = [
  { icon: MapPin, label: "South B, Nairobi", sub: "A safe, quiet sanctuary" },
  { icon: Car, label: "10 min to JKIA", sub: "Effortless airport access" },
  { icon: KeyRound, label: "Private Arrival", sub: "Seamless, self-managed check-in" },
  { icon: ShieldCheck, label: "Secure Direct Pay", sub: "Verified M-Pesa transactions" },
];

export default function TrustStrip({ host }: TrustStripProps) {
  return (
    <section style={{ backgroundColor: "#0B1526", borderTop: "1px solid rgba(184,147,90,0.12)", borderBottom: "1px solid rgba(184,147,90,0.12)" }}>
      <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <Icon size={18} style={{ color: "#D4B483", flexShrink: 0 }} />
              <div>
                <p className="text-white text-sm font-medium leading-tight">{item.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
