import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://africaelsuites.com"), // ← REPLACE once the real platform domain is live
  title: "African El Suites | Curated Short-Stay Apartments in Kenya",
  description:
    "Book direct, furnished short-stay apartments across Kenya. No booking fees, M-Pesa accepted, real photos only.",
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// NOTE: Per-property metadata (title, description, OG image, JSON-LD) lives
// in app/[slug]/page.tsx via generateMetadata() — every listing needs its
// own SEO identity, not the platform's. This root layout only covers
// platform-wide defaults and the pages that aren't a specific property
// (like the "/" directory and 404).

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
