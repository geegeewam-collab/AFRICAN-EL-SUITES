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

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustStrip />
      <SpaceBooking />
      <Gallery />
      <Pricing />
      <EnhanceStay />
      <Amenities />
      <Location />
      <Reviews />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
