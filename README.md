# Single-property booking site (Next.js + Firestore + M-Pesa STK Push)

One property, one site. Everything about the property lives in `lib/property.ts`.
Money rules (deposit %, commission %) live in `lib/pricing.ts`.

## Reusing it for the next client
1. Edit `lib/property.ts` (name, rates, WhatsApp, address, map, gallery text).
2. Replace the photos in `public/images/`.
3. New Vercel project + new Firebase project + the client's own Daraja shortcode.
4. Set the env vars from `.env.example`.

## Go-live checklist
- [ ] Hosting plan decided (see note on Vercel Hobby terms below)
- [ ] Firebase project created, Firestore enabled, rules set to deny all client access
- [ ] `FIREBASE_SERVICE_ACCOUNT` pasted as ONE line in the host's env settings
- [ ] Owner's Daraja app approved for live (their paybill/till, not yours)
- [ ] `DARAJA_ENV=production`, callback URL = `https://DOMAIN/api/mpesa/callback?token=SECRET`
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain
- [ ] Test one real booking end to end with a small amount
- [ ] Written agreement with the owner on fees and the monthly statement

## Where bookings live
Firestore collection `bookings`. Each document has `paymentStatus` (pending / paid / failed),
`totalAmount`, `depositAmount`, `commissionAmount` and the M-Pesa receipt. Sum `commissionAmount`
over paid bookings for the month to produce the statement.

## Hosting note
Vercel's Hobby plan is for personal, non-commercial use. A client's booking site that takes
payments is commercial, so use a paid plan or a host whose free tier allows commercial use
(check its terms first). The API routes run inside the Next.js app, so no separate backend is needed.
