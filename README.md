# Serenity Suites Nairobi — Direct Booking Website

A premium, single-property booking site for **Serenity Suites Nairobi** (South B, Nairobi).
Built with Next.js 14, Firebase/Firestore, and M-Pesa STK Push (Daraja API).

---

## Project Overview

**This is NOT a multi-tenant SaaS or marketplace.**  
It is a dedicated direct-booking website for ONE property: **Serenity Suites Nairobi**.

The business model:
- Property owner acquires guests via WhatsApp, Instagram, referrals, word of mouth
- This website converts those visitors into direct bookings
- No platform fees shown to guests — the site shows the property's normal rates
- Developer commission (1.5%) is an internal accounting matter, not a guest-facing fee

---

## Architecture

```
Frontend:     Next.js 14 (App Router) on Vercel
Database:     Firebase Firestore (admin SDK only — client access denied)
Payments:     M-Pesa STK Push via Safaricom Daraja API
Email:        Gmail SMTP (App Password) for owner notifications
Hosting:      Vercel (paid plan for commercial use)
Domain:       serenitysuites.co.ke (configured at root, not a subdirectory)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/property.ts` | **Single source of truth** for all property data (name, rates, WhatsApp, address, gallery, etc.) |
| `lib/pricing.ts` | Pricing config (weekday/weekend rates, deposit %, commission %) + `quote()` function |
| `lib/payments.ts` | Server-side booking creation, availability check, M-Pesa STK Push |
| `lib/whatsapp.ts` | WhatsApp message generators (guest confirmation, owner alert, inquiry) |
| `lib/notify.ts` | Email notifications to owner |
| `lib/availability.ts` | Fetch unavailable date ranges (bookings + owner blocks) |
| `lib/dates.ts` | Shared date utilities (UTC-based, timezone-safe) |
| `lib/types.ts` | TypeScript interfaces (Booking, Block, HostProfile) |
| `lib/firebaseAdmin.ts` | Firebase Admin SDK initialization |
| `app/api/pay/route.ts` | POST: create booking → initiate STK Push |
| `app/api/mpesa/callback/route.ts` | POST: Safaricom callback → verify payment → confirm booking |
| `app/api/availability/route.ts` | GET: public availability ranges for calendar |
| `app/admin/page.tsx` | Owner dashboard (password-protected) |
| `app/api/admin/action/route.ts` | Admin actions: block dates, mark paid, cancel |

---

## Data Model (Firestore)

### `bookings` collection
```typescript
{
  guestName: string,
  guestPhone: string,           // normalized to 2547XXXXXXXX
  checkIn: "YYYY-MM-DD",
  checkOut: "YYYY-MM-DD",
  guests: number,
  nights: number,
  weekdayNights: number,        // NEW: for accurate pricing breakdown
  weekendNights: number,        // NEW: for accurate pricing breakdown
  totalAmount: number,          // total accommodation
  depositAmount: number,        // 50% of total
  balanceAmount: number,        // remaining 50%
  commissionAmount: number,     // 1.5% of total (internal)
  paymentStatus: "pending" | "paid" | "failed" | "cancelled",
  bookingStatus: "pending" | "confirmed" | "failed" | "cancelled",
  mpesaReceipt: string | null,
  checkoutRequestId: string | null,
  createdAtMs: number,
  updatedAtMs: number,
  paidAtMs?: number,
  cancelledAtMs?: number,
}
```

### `blocks` collection
```typescript
{
  checkIn: "YYYY-MM-DD",
  checkOut: "YYYY-MM-DD",
  note: string,                 // e.g. "Airbnb guest", "Maintenance"
  createdAtMs: number,
}
```

---

## Pricing Logic

**Single source of truth:** `lib/pricing.ts` → `PRICING_CONFIG`

```typescript
{
  weekdayRate: 3500,      // Sun–Thu nights
  weekendRate: 4000,      // Fri–Sat nights
  depositRate: 0.5,       // 50% deposit
  commissionRate: 0.015,  // 1.5% developer commission
  maxNights: 30,
  maxGuests: 2,
}
```

The `quote(checkIn, checkOut)` function:
- Iterates each night individually
- Counts weekday vs weekend nights correctly
- Returns: `nights`, `weekdayNights`, `weekendNights`, `total`, `deposit`, `balance`, `commission`
- Used by BOTH the client (display) AND server (authoritative calculation)

**Example:** Oct 10 (Thu) → Oct 13 (Sun) = 3 nights
- Oct 10 (Thu): weekday = 3,500
- Oct 11 (Fri): weekend = 4,000
- Oct 12 (Sat): weekend = 4,000
- **Total: 11,500** (not 3 × 3,500 = 10,500)

---

## Booking Flow

```
1. Guest selects dates on calendar (availability checked via /api/availability)
2. Guest enters name + phone + guests
3. Client shows price breakdown (weekday/weekend nights, total, deposit, balance)
4. Guest clicks "Confirm & Pay Deposit"
5. POST /api/pay:
   - Server validates dates, checks availability AGAIN
   - Creates booking in Firestore (paymentStatus: "pending")
   - Initiates real M-Pesa STK Push to guest's phone
6. Guest enters M-Pesa PIN on phone
7. Safaricom calls /api/mpesa/callback:
   - Verifies callback secret
   - If ResultCode === 0: marks booking paid, saves receipt
   - Sends email to owner
   - Generates WhatsApp confirmation message (logged for manual send)
8. Guest sees "Check your phone" screen with WhatsApp button
9. Guest taps → opens WhatsApp with pre-filled confirmation message
```

---

## Environment Variables

See `.env.example` for all required variables.

**Critical:**
- `FIREBASE_SERVICE_ACCOUNT` — entire JSON as ONE line
- `DARAJA_*` — Safaricom Daraja credentials (sandbox → production)
- `DARAJA_CALLBACK_URL` — must be `https://YOURDOMAIN/api/mpesa/callback?token=SECRET`
- `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` — long random strings
- `ALERT_EMAIL_USER` + `ALERT_EMAIL_APP_PASSWORD` — Gmail App Password for owner alerts
- `NEXT_PUBLIC_SITE_URL` — `https://serenitysuites.co.ke`

---

## Owner Dashboard (`/admin`)

Password-protected. Shows:
- Monthly statement (paid bookings starting that month)
- Commission calculation (1.5% of total)
- Copy-to-WhatsApp statement button
- Blocked dates management (for Airbnb, personal use, maintenance)
- All bookings with filters (paid/pending/failed/cancelled)
- Manual actions: mark paid (with receipt), cancel, block/unblock dates

---

## WhatsApp Integration

Three message types (all in `lib/whatsapp.ts`):

1. **Guest Booking Confirmation** — sent after payment succeeds
   - Booking ref (SS-XXXX), dates, guests, amount paid, balance
   - Opens via "Confirm on WhatsApp" button on success screen

2. **Guest Inquiry** — from Hero/Calendar "Check Availability" button
   - Pre-fills dates, guests, opens WhatsApp to host

3. **Owner Notification** — generated in callback, sent via email + logged
   - Full booking details + one-tap WhatsApp link to guest
   - Dashboard link

---

## Go-Live Checklist

- [ ] Hosting: Vercel **Pro/Enterprise** (Hobby is non-commercial only)
- [ ] Firebase project created, Firestore enabled
- [ ] Firestore rules: `match /databases/{database}/documents { match /{document=**} { allow read, write: if false; } }`
- [ ] `FIREBASE_SERVICE_ACCOUNT` added as ONE line in Vercel env
- [ ] Owner's Daraja app approved for **production** (their paybill/till)
- [ ] `DARAJA_ENV=production`, callback URL configured in Daraja portal
- [ ] `NEXT_PUBLIC_SITE_URL=https://serenitysuites.co.ke`
- [ ] Test one real booking end-to-end with small amount (KES 10)
- [ ] Written agreement with owner on:
    - Monthly statement date
    - Commission rate (1.5% of total booking value)
    - Payment terms (owner receives full booking amount, commission reconciled monthly)
- [ ] Domain configured: `serenitysuites.co.ke` → Vercel
- [ ] SSL, headers, SEO metadata verified

---

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit     # type check
```

---

## Deployment Notes

- **No separate backend needed** — API routes run inside Next.js on Vercel
- **Firebase Admin SDK** bypasses Firestore rules (server-only)
- **Client-side Firestore access is denied** — all DB ops go through API routes
- **M-Pesa credentials never exposed to browser** — only in server env vars
- **Idempotent callbacks** — Safaricom retries handled via `checkoutRequestId` + `paymentStatus` check
- **15-min hold** on unpaid bookings prevents double-booking during STK Push

---

## License

Proprietary — built for Serenity Suites Nairobi.