import { HostProfile } from "@/lib/types";

// Appears only once the owner has filled in `policies` in lib/property.ts.
export default function Policies({ host }: { host: HostProfile }) {
  const items = host.policies ?? [];
  if (items.length === 0) return null;
  return (
    <section id="good-to-know" className="section-pad" style={{ backgroundColor: "#EFE7D6" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="eyebrow" style={{ color: "#8F7143" }}>Good to know</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif" style={{ color: "#0B1526" }}>Stay details</h2>
        </div>
        <dl className="grid sm:grid-cols-2 gap-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-sm p-5 bg-white" style={{ border: "1px solid rgba(184,147,90,0.2)" }}>
              <dt className="font-serif text-lg mb-1" style={{ color: "#0B1526" }}>{it.title}</dt>
              <dd className="text-sm leading-relaxed" style={{ color: "#5B564B" }}>{it.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
