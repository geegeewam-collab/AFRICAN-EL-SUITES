import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import SpaceBooking from "@/components/SpaceBooking";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import EnhanceStay from "@/components/EnhanceStay";
import Amenities from "@/components/Amenities";
import Location from "@/components/Location";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getHostBySlug } from "@/lib/db";

interface PageProps {
  params: { slug: string };
}

// This is what makes the platform actually multi-tenant: every request
// re-fetches by slug, so /serenity-suites, /kingb-loft, /whatever all
// render from the same code with a different host's data. No redeploy
// needed to onboard a new property, no per-client copy of the codebase.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const host = await getHostBySlug(params.slug);
  if (!host) {
    return { title: "Listing not found | African El Suites" };
  }

  const title = `${host.name} | ${host.address.area} Short Stay`;
  const description = host.heroSubtext;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_KE",
      siteName: "African El Suites",
      images: [{ url: host.heroImage, width: 1600, height: 900, alt: host.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [host.heroImage],
    },
    alternates: {
      canonical: `/${host.slug}`,
    },
  };
}

export default async function HostPage({ params }: PageProps) {
  const host = await getHostBySlug(params.slug);

  if (!host) {
    notFound();
  }

  return (
    <main>
      {/* Structured data is per-property, not platform-wide — each
          listing needs to describe itself accurately to search engines. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: host.name,
            description: host.description,
            url: `https://africaelsuites.com/${host.slug}`,
            telephone: `+${host.whatsappNumber}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: `${host.address.line1}, ${host.address.line2}`,
              addressLocality: host.address.area,
              addressCountry: "KE",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: host.geo.latitude,
              longitude: host.geo.longitude,
            },
            priceRange: `KES ${host.nightlyRate.weekday} - KES ${host.nightlyRate.weekend} per night`,
          }),
        }}
      />

      <Navbar host={host} />
      <Hero host={host} />
      <TrustStrip host={host} />
      <SpaceBooking host={host} />
      <Gallery host={host} />
      <Pricing host={host} />
      <EnhanceStay host={host} />
      <Amenities host={host} />
      <Location host={host} />
      <Reviews host={host} />
      <Footer host={host} />
      <WhatsAppButton host={host} />
    </main>
  );
}
