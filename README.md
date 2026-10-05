# Serenity Suites Nairobi: single-property booking site

Next.js 14 + Firestore + M-Pesa (Daraja) + Africa's Talking SMS. Hosted on Vercel.

**Start with [`SETUP.md`](./SETUP.md)** (admin password, database, M-Pesa, SMS, calendar sync, checklist).

## What it does
* One-page marketing site: photos, rates, amenities, location, reviews (only real ones), policies (when filled in).
* Availability calendar. Taken dates are crossed out; Airbnb/Booking.com bookings are included via iCal.
* Booking form with two modes: live M-Pesa deposit (instant confirmation) or "request on WhatsApp".
* Automatic confirmations: SMS to guest and owner, email to owner. Sent once per booking, even if Safaricom retries.
* Owner dashboard `/admin`: bookings, Mark paid / Cancel / Resend SMS, add a booking by hand, block dates,
  monthly commission statement, change password, setup status, Airbnb calendar link.

## Reusing it for another property
1. Edit `lib/property.ts` (name, rates, address, WhatsApp, photos) and swap the images in `public/images/`.
2. New Vercel project + new Firebase project + the client's own Daraja shortcode.
3. Fill the environment variables from `.env.example`.

## Where the rules live
* `lib/property.ts`: everything about the property, including nightly rates (the only place prices are typed).
* `lib/pricing.ts`: deposit %, commission %, max nights. Used by the form (display) and the server (the amount charged).
* `lib/confirm.ts`: "mark paid exactly once, then notify".
* `lib/availability.ts` + `lib/ical.ts`: what is bookable.

## Security notes
* All money amounts are computed on the server from the dates; the browser can't change them.
* `/admin` and every admin API need the signed session cookie; admin writes only accept same-site JSON.
* The database is only touched by the server (`firestore.rules` denies everything else).
* Per-phone limit (3 attempts / 10 min) stops anyone spamming M-Pesa prompts at a number.
* The login check is `async`: always `await passwordOk(...)` (forgetting it makes every password valid).
