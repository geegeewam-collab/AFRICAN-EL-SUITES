export interface HostProfile {
  id: string;
  slug: string; // e.g. "serenity-suites"
  name: string;
  whatsappNumber: string;
  contactEmail: string;
  instagramHandle: string;
  address: {
    line1: string;
    line2: string;
    area: string;
  };
  nightlyRate: {
    weekday: number;
    weekend: number;
  };
  description: string;
  heroTitle: string;
  heroSubtext: string;
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
