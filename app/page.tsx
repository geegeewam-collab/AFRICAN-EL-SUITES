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
import { notFound } from "next/navigation";

export default async function Home() {
  // In a real multi-tenant app, we'd get the slug from the request headers or subdomain.
  // For now, we default to "serenity-suites".
  const host = await getHostBySlug("serenity-suites");

  if (!host) {
    notFound();
  }

  return (
    <main>
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
