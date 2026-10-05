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
import Policies from "@/components/Policies";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { property as host, SITE_URL } from "@/lib/property";

// Rebuild the page at most once an hour so the example stay dates never go stale.
export const revalidate = 3600;

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: host.name,
            description: host.description,
            url: SITE_URL,
            telephone: `+${host.whatsappNumber}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: `${host.address.line1}, ${host.address.line2}`,
              addressLocality: host.address.area,
              addressCountry: "KE",
            },
            geo: { "@type": "GeoCoordinates", latitude: host.geo.latitude, longitude: host.geo.longitude },
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
      <Policies host={host} />
      <Location host={host} />
      <Reviews host={host} />
      <Footer host={host} />
      <WhatsAppButton host={host} />
    </main>
  );
}
