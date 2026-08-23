"use client";

import { Star, Quote } from "lucide-react";
import { waLink } from "@/lib/siteConfig";

export default function Reviews() {
  return (
    <section id="reviews" className="section-pad" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-3xl mx-auto text-center">
        <span className="eyebrow">Guest Reviews</span>
        <h2 className="mt-3 text-3xl md:text-4xl font-serif text-white mb-5">Newly listed</h2>
        <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-10">
          Serenity Suites just opened for direct bookings, so there's no
          review wall to show off yet — that part's honest. Stay with us
          and be the first name here.
        </p>

        <div className="rounded-sm p-8 mx-auto max-w-md border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(184,147,90,0.18)" }}>
          <Quote size={20} style={{ color: "#D4B483", opacity: 0.5 }} className="mx-auto mb-4" />
          <div className="flex gap-1 justify-center mb-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} size={14} style={{ color: "rgba(212,180,131,0.3)" }} />
            ))}
          </div>
          <p className="text-white/40 text-sm italic">Your review could be the first one here.</p>
        </div>

        
          href={waLink("Hi, I just stayed at Serenity Suites Nairobi and wanted to leave a review.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 px-6 py-3 text-sm rounded-sm border transition-all duration-200 hover:bg-white/5"
          style={{ borderColor: "rgba(184,147,90,0.35)", color: "#D4B483" }}
        >
          Leave a Review
        </a>
      </div>
    </section>
  );
}
