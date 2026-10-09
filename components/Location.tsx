import { MapPin, Plane, Building2, ShoppingBag, Coffee, Navigation } from "lucide-react";
import { HostProfile } from "@/lib/types";

interface LocationProps {
  host: HostProfile;
}

const distances = [
  { icon: Plane, label: "JKIA Airport", distance: "15-20 mins", detail: "Via Mombasa Road" },
  { icon: Building2, label: "Nairobi CBD", distance: "15-25 mins", detail: "Depending on traffic" },
  { icon: ShoppingBag, label: "Mombasa Road", distance: "2 mins", detail: "Main highway" },
  { icon: Coffee, label: "Bellevue Area", distance: "Walking", detail: "Shops & restaurants" },
];

export default function Location({ host }: LocationProps) {
  const place = `${host.address.line1}, ${host.address.area}, Kenya`;
  const embed = host.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
  return (
    <section id="location" className="section-pad" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="eyebrow">Location</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif text-white mb-4">Prime location</h2>
          <p className="text-white/45 text-sm max-w-md mx-auto">
            {host.address.area}, Nairobi
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-sm overflow-hidden border relative" style={{ borderColor: "rgba(184,147,90,0.18)", height: "clamp(300px, 55vw, 380px)" }}>
            <iframe
              src={embed}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${host.name} Location`}
            />
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-sm shadow-lg"
              style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
            >
              <Navigation size={14} /> Open in Google Maps
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 p-4 rounded-sm border" style={{ background: "rgba(184,147,90,0.06)", borderColor: "rgba(184,147,90,0.18)" }}>
              <MapPin size={18} style={{ color: "#D4B483", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="text-white font-medium text-sm">{host.address.area}</p>
                <p className="text-white/50 text-xs mt-0.5">Nairobi, Kenya</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {distances.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-4 rounded-sm border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={15} style={{ color: "#D4B483" }} />
                      <span className="text-xs font-semibold" style={{ color: "#D4B483" }}>{item.distance}</span>
                    </div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{item.detail}</p>
                  </div>
                );
              })}
            </div>

            <p className="text-white/30 text-xs leading-relaxed mt-2">
              Exact address and access instructions sent via WhatsApp upon booking confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
