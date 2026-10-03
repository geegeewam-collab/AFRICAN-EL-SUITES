"use client";

import { useState, useEffect } from "react";
import { Menu, X, CalendarDays } from "lucide-react";
import { HostProfile } from "@/lib/types";

interface NavbarProps {
  host: HostProfile;
}

const navLinks = [
  { label: "The Suite", href: "#gallery" },
  { label: "Rates", href: "#pricing" },
  { label: "Amenities", href: "#amenities" },
  { label: "Location", href: "#location" },
  { label: "Reviews", href: "#reviews" },
];

export default function Navbar({ host }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4"
      style={{
        backgroundColor: scrolled ? "rgba(11,21,38,0.98)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(184,147,90,0.15)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        <a href="#" className="flex flex-col leading-none group">
          <span className="text-xl font-serif text-white tracking-wide group-hover:text-[#D4B483] transition-colors duration-300">
            {host.name}
          </span>
          <span className="text-[0.65rem] tracking-[0.28em] uppercase" style={{ color: "#D4B483" }}>
            {host.address.area}
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 md:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/70 hover:text-white transition-colors duration-200 tracking-wide relative"
            >
              {link.label}
              <span className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-[#B8935A] scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
          <a
            href="#book"
            className="px-5 py-2.5 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90 hover:scale-105 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526", boxShadow: "0 4px 20px rgba(184,147,90,0.3)" }}
          >
            <CalendarDays size={14} />
            Book Your Stay
          </a>
        </div>

        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 mt-4 animate-in slide-in-from-top duration-300" style={{ backgroundColor: "rgba(11,21,38,0.99)", backdropFilter: "blur(20px)" }}>
          <div className="flex flex-col px-5 py-5 gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/80 text-base py-2 hover:text-white transition-colors duration-200 relative pl-2"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#book"
              className="text-center px-5 py-3 text-sm font-medium rounded-sm mt-2 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
              onClick={() => setMenuOpen(false)}
            >
              <CalendarDays size={14} />
              Book Your Stay
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}