import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { HostProfile } from "@/lib/types";
import { PRICING_CONFIG } from "@/lib/pricing";
import { getBookingInquiryWhatsAppUrl } from "@/lib/whatsapp";

export default function Hero({ host }: { host: HostProfile }) {
  const deposit = Math.round(PRICING_CONFIG.depositRate * 100);
  const wa = getBookingInquiryWhatsAppUrl({ checkIn: "", checkOut: "", guests: 2 });

  return (
    <section id="hero" className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
      <Image src={host.heroImage} alt={`${host.name} living room`} fill priority sizes="100vw" className="object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(11,21,38,0.62) 0%, rgba(11,21,38,0.40) 38%, rgba(11,21,38,0.92) 100%)" }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 pt-32 pb-24 md:py-32">
        <span className="eyebrow block max-w-xl leading-relaxed">
          {host.address.area} · Nairobi
        </span>
        <h1 className="mt-4 font-serif text-[2.6rem] leading-[1.08] sm:text-5xl md:text-7xl text-white max-w-3xl">{host.heroTitle}</h1>
        <p className="mt-5 text-white/80 text-base md:text-lg max-w-xl leading-relaxed">{host.heroSubtext}</p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href="#book"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium rounded-sm transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526", boxShadow: "0 8px 30px rgba(184,147,90,0.35)" }}
          >
            Check availability <ArrowRight size={16} />
          </a>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium rounded-sm border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            <MessageCircle size={16} /> Ask us on WhatsApp
          </a>
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
          <li>
            From <strong className="font-medium text-[#D4B483]">KES {PRICING_CONFIG.weekdayRate.toLocaleString("en-US")}</strong> / night
          </li>
          <li className="hidden sm:block text-white/25" aria-hidden="true">|</li>
          <li>{deposit}% deposit secures your stay</li>
          <li className="hidden sm:block text-white/25" aria-hidden="true">|</li>
          <li>No platform fees</li>
        </ul>
      </div>
    </section>
  );
}
