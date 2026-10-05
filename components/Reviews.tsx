import { Quote, Star } from "lucide-react";
import { HostProfile } from "@/lib/types";

// Shows ONLY real reviews from lib/property.ts. No reviews yet = no section (nothing fake is ever shown).
export default function Reviews({ host }: { host: HostProfile }) {
  const reviews = host.reviews ?? [];
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="section-pad" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className="eyebrow">The Guest Circle</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-serif text-white mb-4">What guests say</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">Words from people who have stayed at {host.name}.</p>
        </div>

        <div className={`grid gap-6 ${reviews.length === 1 ? "max-w-xl mx-auto" : reviews.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
          {reviews.map((r, i) => (
            <figure
              key={i}
              className="rounded-sm p-7 md:p-8 border"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(184,147,90,0.15)" }}
            >
              <Quote size={22} style={{ color: "#D4B483", opacity: 0.4 }} className="mb-4" />
              <div className="flex gap-0.5 mb-4" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} fill="#D4B483" stroke="#D4B483" />
                ))}
              </div>
              <blockquote className="text-white/80 text-[0.95rem] leading-relaxed italic">“{r.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-serif" style={{ background: "rgba(184,147,90,0.15)", color: "#D4B483" }}>
                  {r.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-white text-sm font-medium">{r.name}</span>
                  {r.role && <span className="block text-white/40 text-[11px] uppercase tracking-wider">{r.role}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
