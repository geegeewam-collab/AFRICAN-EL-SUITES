"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "The Suite", href: "#gallery" },
  { label: "Rates", href: "#pricing" },
  { label: "Amenities", href: "#amenities" },
  { label: "Location", href: "#location" },
  { label: "Reviews", href: "#reviews" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4"
      style={{
        backgroundColor: scrolled ? "rgba(11,21,38,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(184,147,90,0.15)" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        <a href="#" className="flex flex-col leading-none">
          <span className="text-xl font-serif text-white tracking-wide">Serenity Suites</span>
          <span className="text-[0.65rem] tracking-[0.28em] uppercase" style={{ color: "#D4B483" }}>
            Nairobi
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            
              key={link.label}
              href={link.href}
              className="text-sm text-white/70 hover:text-white transition-colors duration-200 tracking-wide"
            >
              {link.label}
            </a>
          ))}
          
            href="#book"
            className="px-5 py-2.5 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
          >
            Book Direct
          </a>
        </div>

        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 mt-4" style={{ backgroundColor: "rgba(11,21,38,0.98)" }}>
          <div className="flex flex-col px-5 py-4 gap-4">
            {navLinks.map((link) => (
              
                key={link.label}
                href={link.href}
                className="text-white/80 text-base py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            
              href="#book"
              className="text-center px-5 py-3 text-sm font-medium rounded-sm mt-2"
              style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
              onClick={() => setMenuOpen(false)}
            >
              Book Direct
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
