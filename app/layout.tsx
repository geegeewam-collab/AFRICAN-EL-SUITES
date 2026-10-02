import type { Metadata } from "next";
import "./globals.css";
import { property, SITE_URL } from "@/lib/property";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${property.name} | ${property.address.area} Short Stay`,
  description: property.heroSubtext,
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true },
  openGraph: {
    title: property.name,
    description: property.heroSubtext,
    type: "website",
    locale: "en_KE",
    images: [{ url: property.heroImage, width: 1600, height: 900, alt: property.name }],
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
      </head>
      <body>{children}</body>
    </html>
  );
}
