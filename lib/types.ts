export interface GalleryImage {
  src: string;
  alt: string;
  label: string;
}

export interface HostProfile {
  id: string;
  slug: string; // e.g. "serenity-suites" — this becomes the URL: /serenity-suites
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
  mapEmbedUrl: string; // Google Maps "Embed a map" src, specific to this property
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
  hostId: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  depositAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
}
