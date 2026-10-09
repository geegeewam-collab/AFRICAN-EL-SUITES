export interface GalleryImage {
  src: string;
  alt: string;
  label: string;
}

export interface Review {
  quote: string;
  name: string;
  role?: string; // e.g. "Business traveller"
}

export interface HostProfile {
  id: string;
  slug: string;
  name: string;
  whatsappNumber: string;
  contactEmail: string;
  instagramHandle: string;
  address: {
    line1: string;
    line2: string;
    area: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  mapEmbedUrl?: string; // optional: a Google Maps "Embed a map" src. If empty, the map is built from the address.
  reviews?: Review[]; // real guest reviews. If empty, the Reviews section is hidden.
  policies?: { title: string; text: string }[]; // optional house rules / cancellation terms. Hidden if empty.
  nightlyRate: {
    weekday: number;
    weekend: number;
  };
  description: string;
  heroTitle: string;
  heroSubtext: string;
  heroImage: string; // path under /public, e.g. "/images/serenity/living-room-tv.jpg"
  gallery: GalleryImage[]; // first 4 double as The Space collage; all 8+ show in the full Gallery grid
}

export interface Booking {
  id: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  commissionAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  bookingStatus: "pending" | "confirmed" | "failed" | "cancelled";
  mpesaReceipt?: string | null;
  checkoutRequestId?: string | null;
  createdAtMs: number;
  updatedAtMs: number;
  paidAtMs?: number;
  cancelledAtMs?: number;
  source?: "web" | "manual";
  failReason?: string | null;
  notify?: { guestSms?: string; ownerSms?: string; ownerEmail?: string };
  // Added after successful payment
  whatsappConfirmationMessage?: string | null;
  ownerNotificationMessage?: string | null;
}

export interface Block {
  id: string;
  checkIn: string;
  checkOut: string;
  note: string;
  createdAtMs: number;
}