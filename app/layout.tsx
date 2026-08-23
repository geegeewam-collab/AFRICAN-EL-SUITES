import type { Metadata } from "next";
import "./globals.css";
import { WHATSAPP_NUMBER } from "@/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL("https://serenitysuitesnairobi.com"), // ← REPLACE once the real domain is live
  title: "Serenity Suites Nairobi | Furnished 1BR Short Stay South B",
  description:
    "Fully furnished 1-bedroom apartment in South B Nairobi. WiFi, Smart TV, Parking. KES 3,500/night. 10 mins from JKIA. Book directly via WhatsApp.",
  keywords: [
    "furnished apartment Nairobi",
    "short stay South B",
    "Airbnb near JKIA",
    "short term rental Nairobi",
    "furnished 1 bedroom Nairobi",
    "Sanasana Riviera apartments",
    "serviced apartment South B Nairobi",
    "daily rental Nairobi",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Serenity Suites Nairobi | Your Quiet Address in South B",
    description:
      "Fully furnished 1-bedroom apartment in South B Nairobi. WiFi, Smart TV, Parking. KES 3,500/night. 10 mins from JKIA.",
    url: "https://serenitysuitesnairobi.com",
    siteName: "Serenity Suites Nairobi",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/images/living-room-tv.jpg", width: 1600, height: 900, alt: "Serenity Suites Nairobi living room" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serenity Suites Nairobi",
    description: "Your quiet address in South B. Fully furnished, KES 3,500/night.",
    images: ["/images/living-room-tv.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://serenitysuitesnairobi.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              name: "Serenity Suites Nairobi",
              description:
                "Fully furnished 1-bedroom short-stay apartment in South B, Nairobi. Fitted kitchenette, Smart TV, and secure parking.",
              url: "https://serenitysuitesnairobi.com",
              telephone: `+${WHATSAPP_NUMBER}`,
              address: {
                "@type": "PostalAddress",
                streetAddress: "Sanasana Riviera Apartments, 4th Floor, House 405",
                addressLocality: "South B",
                addressRegion: "Nairobi",
                addressCountry: "KE",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -1.3192,
                longitude: 36.8328,
              },
              priceRange: "KES 3,500 - KES 4,000 per night",
              amenityFeature: [
                { "@type": "LocationFeatureSpecification", name: "High-speed WiFi", value: true },
                { "@type": "LocationFeatureSpecification", name: "Smart TV", value: true },
                { "@type": "LocationFeatureSpecification", name: "Secure Parking", value: true },
                { "@type": "LocationFeatureSpecification", name: "24/7 Security", value: true },
                { "@type": "LocationFeatureSpecification", name: "Elevator", value: true },
                { "@type": "LocationFeatureSpecification", name: "Balcony", value: true },
              ],
              sameAs: [],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
