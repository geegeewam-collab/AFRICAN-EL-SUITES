# Setup guide: Serenity Suites Nairobi

Everything below can be done from a phone. Do the steps in order. Each one is independent,
so the site keeps working even if you stop halfway: anything not set up simply stays switched off
(the "Setup status" box at the bottom of `/admin` shows what is on and what is not).

---

## 1. The admin password (do this first)

The owner dashboard lives at **your-site.com/admin**.

### Set it
1. Open **Vercel > your project > Settings > Environment Variables**.
2. Add two variables (Environment: Production, Preview and Development all ticked):

   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | 3 or 4 random words, 12+ characters, e.g. `copper-lantern-river-42` |
   | `ADMIN_SESSION_SECRET` | 40+ random characters (keyboard mash, or your phone's "suggest strong password") |

3. **Redeploy**: Deployments > the latest one > **...** > **Redeploy**. (Vercel only reads new
   variables on a new deployment.)
4. Open `/admin`, type the password, and you're in. You stay signed in for 7 days.

### Login says something other than "Wrong password"?
The login page now tells you which setting is missing:

| Message on the login page | What it means | Fix |
|---|---|---|
| Wrong password. Try again. | Password is wrong (or a password saved from the dashboard is overriding `ADMIN_PASSWORD`) | Retype it; see "Forgot it?" below |
| No password is set on this deployment | `ADMIN_PASSWORD` is empty or not in this environment | Add it in Vercel, **redeploy** |
| Can't reach the database to check the password | `FIREBASE_SERVICE_ACCOUNT` is set but broken, or Firestore was never created | Do step 2 below; exact error is in Vercel > Logs (search `[admin]`) |
| Password accepted, but ADMIN_SESSION_SECRET is missing | The 2nd variable is missing | Add it in Vercel, **redeploy** |

Never put the password in the source code: anyone who can see the repository would know it.

### Change it later (from the dashboard)
Dashboard > **Change Password** > type the current one, then the new one twice (12+ characters).
From then on the dashboard uses the new password and the `ADMIN_PASSWORD` variable is ignored.

### Forgot it?
In **Firebase > Firestore Database**, open the collection `settings` and delete the document `admin`.
The dashboard then goes back to the `ADMIN_PASSWORD` value in Vercel.

### Log everyone out / someone else saw the password
Change `ADMIN_SESSION_SECRET` to a new random value and redeploy. Every existing login stops working.
Then change the password.

---

## 2. Firebase (the database)

1. console.firebase.google.com > **Add project** (Analytics not needed).
2. **Build > Firestore Database > Create database** > Production mode > pick a nearby region.
3. **Rules** tab: paste the contents of `firestore.rules` from this repo, then **Publish**. (It blocks all
   direct access; the website talks to the database from the server only.)
4. **Project settings (gear) > Service accounts > Generate new private key**. A `.json` file downloads.
5. Open it, copy **everything**, and put it in Vercel as `FIREBASE_SERVICE_ACCOUNT`
   (one line is fine; paste as is).
6. Redeploy.

You do not need to create any collections or indexes. They appear by themselves.

---

## 3. Switching the site to "request on WhatsApp" mode vs live payments

The booking form has two modes:

* **`NEXT_PUBLIC_PAYMENTS_ENABLED=false`** (default). Guests pick dates on the calendar, see the price,
  and one tap opens WhatsApp with everything filled in. The calendar still shows taken dates.
  The owner adds the booking in `/admin > Add a booking`, which blocks the dates.
* **`NEXT_PUBLIC_PAYMENTS_ENABLED=true`**. The form takes the 50% deposit by M-Pesa, confirms the booking
  by itself and sends the SMS messages. Turn this on only after step 4 is finished and tested.

After changing a `NEXT_PUBLIC_` value: **redeploy**.

---

## 4. M-Pesa (Safaricom Daraja)

The money goes straight to the **owner's** paybill/till, so the Daraja app must be the owner's
(business documents needed). Safaricom's "Go Live" approval takes days, so start early.

1. developer.safaricom.co.ke > create an app with **Lipa na M-Pesa Sandbox**.
2. Put these in Vercel: `DARAJA_CONSUMER_KEY`, `DARAJA_CONSUMER_SECRET`, `DARAJA_SHORTCODE`,
   `DARAJA_PASSKEY`, `DARAJA_ENV=sandbox`.
3. Make up a long random text for `DARAJA_CALLBACK_SECRET`, then set
   `DARAJA_CALLBACK_URL` to `https://YOUR-DOMAIN/api/mpesa/callback?token=` followed by that same text.
4. Till number (Buy Goods)? Also set `DARAJA_TRANSACTION_TYPE=CustomerBuyGoodsOnline` and `DARAJA_PARTY_B=<till>`.
5. Redeploy and test a booking with the sandbox test number.
6. When Safaricom approves the live app: swap in the live keys, set `DARAJA_ENV=production` and
   `NEXT_PUBLIC_PAYMENTS_ENABLED=true`, redeploy, then make **one small real test**: temporarily set both
   nightly rates in `lib/property.ts` to 10, book one night with your own number (deposit KES 5), check the
   booking confirms, then put the real rates back and cancel the test booking in `/admin`.

---

## 5. Automatic SMS (Africa's Talking)

SMS reaches every Kenyan network without the guest needing anything installed. Each booking sends
**one SMS to the guest** (reference, dates, deposit, balance) and **one to the owner**.
Cost is roughly KES 1 per message.

1. africastalking.com > create an account > create an app.
2. Test first: `AT_USERNAME=sandbox` and your **API key**. In sandbox nothing is delivered
   (the dashboard's Setup status shows "Sandbox mode").
3. Go live: top up a little airtime, then set `AT_USERNAME` to your real app username and use the
   live API key.
4. Set `OWNER_ALERT_PHONE` (e.g. `2547XXXXXXXX`) and `NEXT_PUBLIC_SMS_ENABLED=true`. Redeploy.

If an SMS ever fails the booking is **not** affected; the dashboard shows "Guest SMS: failed" and a
**Resend SMS** button.

> Why not automatic WhatsApp messages? WhatsApp only allows a business to start a chat using
> pre-approved message templates through Meta's paid Business API, which needs business verification.
> The dashboard has one-tap WhatsApp buttons for anything personal.

---

## 6. Email alert to the owner (free)

1. On the owner's Gmail: Google Account > Security > turn on **2-Step Verification**, then
   **App passwords** > create one.
2. Set `ALERT_EMAIL_USER` (the Gmail address) and `ALERT_EMAIL_APP_PASSWORD` (the 16-character code).
3. Redeploy.

---

## 7. Airbnb / Booking.com calendar sync (stops double-bookings)

* **Their bookings block this site:** in Airbnb/Booking.com copy the "Export calendar" link, then set
  `ICAL_IMPORT_URLS` to it (several links separated by commas). Refreshed every 10 minutes.
* **This site's bookings block them:** set `ICAL_EXPORT_TOKEN` to a long random text, redeploy, then copy
  the link shown in `/admin > Setup status` into Airbnb/Booking.com **Import calendar**.

Airbnb and Booking.com refresh imported calendars only every few hours themselves, so a gap of a few
hours is normal.

---

## 8. Domain

Vercel > Settings > **Domains** > add the domain and follow the DNS instructions, then set
`NEXT_PUBLIC_SITE_URL=https://your-domain` (used for link previews, SMS and emails) and redeploy.

---

## 9. Content the owner should fill in (`lib/property.ts`)

* `reviews`: real guest reviews only. While the list is empty the Reviews section is hidden.
* `policies`: check-in/out times, cancellation terms, house rules. Hidden while empty.
* `mapEmbedUrl` (optional): for a pin on the exact building. Google Maps > Share > *Embed a map* >
  copy the `src="..."` link.
* Nightly rates (`nightlyRate`) are the only place prices are typed. The website, the booking form and the
  amounts charged all read them from there.

---

## Before you go live: 10-minute checklist

- [ ] `/admin` opens and the password works; a wrong password is rejected
- [ ] Setup status in `/admin` shows what you expect
- [ ] Make a sandbox booking: the page flips to "You're booked!", an SMS/email arrives (or shows "sandbox")
- [ ] The same dates are crossed out on the calendar afterwards
- [ ] Cancel that test booking in `/admin` (dates free up again)
- [ ] The map shows the right place; "Open in Google Maps" opens it
- [ ] Test on a real phone: hero, calendar, booking form, WhatsApp buttons
