import { MapPin, Phone, Mail } from "lucide-react";
import { WHATSAPP_NUMBER, CONTACT_EMAIL, INSTAGRAM_HANDLE, ADDRESS } from "@/lib/siteConfig";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#070E1A" }}>
      <div className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Serenity Suites</h3>
          <p className="text-xs tracking-[0.25em] uppercase mb-5" style={{ color: "#D4B483" }}>Nairobi</p>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            A private apartment in South B — where comfort meets convenience,
            ten minutes from JKIA.
          </p>
          {INSTAGRAM_HANDLE && (
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-brass transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          )}
        </div>

        <div>
          <h4 className="text-white text-sm font-medium mb-5 tracking-widest uppercase">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            {[
              { label: "The Suite", href: "#gallery" },
              { label: "Book Direct", href: "#book" },
              { label: "Rates", href: "#pricing" },
              { label: "Amenities", href: "#amenities" },
              { label: "Location", href: "#location" },
              { label: "Reviews", href: "#reviews" },
            ].map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-white/50 text-sm hover:text-white transition-colors duration-200">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-medium mb-5 tracking-widest uppercase">Get in Touch</h4>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <MapPin size={15} style={{ color: "#D4B483", flexShrink: 0, marginTop: 2 }} />
              <span className="text-white/50 text-sm leading-relaxed">
                {ADDRESS.line1}<br />{ADDRESS.line2}<br />{ADDRESS.area}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={15} style={{ color: "#D4B483", flexShrink: 0 }} />
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 text-sm hover:text-white transition-colors"
              >
                WhatsApp us to book
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={15} style={{ color: "#D4B483", flexShrink: 0 }} />
              <span className="text-white/50 text-sm">{CONTACT_EMAIL}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t px-5 py-5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/30 text-xs">© {year} Serenity Suites Nairobi. All rights reserved.</p>
          <p className="text-white/20 text-xs">South B · Nairobi · Kenya</p>
        </div>
      </div>
    </footer>
  );
}
