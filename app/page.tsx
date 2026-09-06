import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { getAllHosts } from "@/lib/db";

export default async function PlatformHome() {
  const hosts = await getAllHosts();

  return (
    <main style={{ backgroundColor: "#0B1526", minHeight: "100vh" }}>
      <header className="py-6 border-b" style={{ borderColor: "rgba(184,147,90,0.15)" }}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <span className="text-xl font-serif text-white tracking-wide">
            African El Suites
          </span>
          <span className="text-[0.65rem] tracking-[0.28em] uppercase" style={{ color: "#D4B483" }}>
            Book Direct
          </span>
        </div>
      </header>

      <section className="section-pad text-center max-w-2xl mx-auto">
        <span className="eyebrow">Kenya</span>
        <h1 className="mt-4 text-4xl md:text-5xl font-serif text-white mb-5 leading-tight">
          Curated stays, booked direct.
        </h1>
        <p className="text-white/60 leading-relaxed">
          Every listing below is real — real photos, a real host on WhatsApp,
          and M-Pesa payments with no booking fees stacked on top.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hosts.map((host) => (
          <Link
            key={host.slug}
            href={`/${host.slug}`}
            className="group rounded-sm overflow-hidden border transition-all duration-300 hover:-translate-y-1"
            style={{ borderColor: "rgba(184,147,90,0.18)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
              <Image
                src={host.heroImage}
                alt={host.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} style={{ color: "#D4B483" }} />
                <span className="text-xs" style={{ color: "#D4B483" }}>{host.address.area}</span>
              </div>
              <h2 className="text-white font-serif text-lg mb-1.5">{host.name}</h2>
              <p className="text-white/45 text-sm leading-relaxed mb-4 line-clamp-2">
                {host.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "#D4B483" }}>
                  From KES {host.nightlyRate.weekday.toLocaleString()}/night
                </span>
                <ArrowRight size={15} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      <footer className="border-t px-5 py-6" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-center text-white/30 text-xs">
          © {new Date().getFullYear()} African El Suites. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
