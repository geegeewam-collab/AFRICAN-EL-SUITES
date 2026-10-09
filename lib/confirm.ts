import { adminDb } from "./firebaseAdmin";
import { sendSms, smsConfigured } from "./sms";
import { emailConfigured, sendBookingAlert } from "./notify";
import { BookingInfo, guestSms, ownerSms } from "./messages";
import { generateBookingConfirmationWhatsApp, generateOwnerNotificationWhatsApp } from "./whatsapp";
import { property } from "./property";
import { bookingRef } from "./ref";
import { getUnavailableRanges } from "./availability";
import { rangeFree } from "./dates";

type Notify = "sent" | "failed" | "skipped";
type Mark = { status: "missing" } | { status: "already" } | { status: "conflict" } | { status: "marked"; data: DocumentData };

const ownerPhone = () => process.env.OWNER_ALERT_PHONE || property.whatsappNumber;

const infoFrom = (id: string, b: DocumentData, receipt: string | null): BookingInfo => ({
  bookingId: id,
  guestName: b.guestName,
  guestPhone: b.guestPhone,
  checkIn: b.checkIn,
  checkOut: b.checkOut,
  nights: b.nights,
  guests: b.guests,
  totalAmount: b.totalAmount,
  depositAmount: b.depositAmount,
  mpesaReceipt: receipt,
});

/**
 * Marks a booking paid EXACTLY ONCE (even if Safaricom retries the callback, or the owner
 * clicks "Mark paid" at the same moment) and then sends the confirmations.
 */
export async function finalizePaid(bookingId: string, receipt: string | null): Promise<Mark["status"]> {
  const db = adminDb();
  const ref = db.collection("bookings").doc(bookingId);

  const mark: Mark = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { status: "missing" } as Mark;
    const data = snap.data() as DocumentData;
    if (data.paymentStatus === "paid") return { status: "already" } as Mark;

    // Safety: Re-verify availability before confirming payment.
    // This prevents a guest who paid a late prompt from double-booking dates.
    const ranges = await getUnavailableRanges();
    if (!rangeFree(data.checkIn, data.checkOut, ranges)) {
      tx.update(ref, {
        paymentStatus: "failed",
        bookingStatus: "failed",
        failReason: "Dates were taken while payment was processing",
        updatedAtMs: Date.now(),
      });
      return { status: "conflict" } as Mark;
    }

    tx.update(ref, {
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      mpesaReceipt: receipt,
      paidAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });
    return { status: "marked", data } as Mark;
  });

  if (mark.status === "marked") await notifyPaid(bookingId, mark.data, receipt);
  return mark.status;
}

/** Sends guest SMS + owner SMS + owner email. Never throws: a failed message must not undo a paid booking. */
async function notifyPaid(bookingId: string, b: DocumentData, receipt: string | null) {
  const info = infoFrom(bookingId, b, receipt);
  const results: Record<string, Notify> = {};

  const run = async (key: string, fn: () => Promise<Notify>) => {
    try {
      results[key] = await fn();
    } catch (e) {
      console.error(`[notify] ${key} failed for ${bookingRef(bookingId)}:`, (e as Error)?.message);
      results[key] = "failed";
    }
  };

  await Promise.all([
    run("guestSms", async () => {
      if (!smsConfigured()) return "skipped";
      return (await sendSms(info.guestPhone, guestSms(info))).ok ? "sent" : "failed";
    }),
    run("ownerSms", async () => {
      if (!smsConfigured()) return "skipped";
      return (await sendSms(ownerPhone(), ownerSms(info))).ok ? "sent" : "failed";
    }),
    run("ownerEmail", async () => {
      if (!emailConfigured()) return "skipped";
      await sendBookingAlert(info);
      return "sent";
    }),
  ]);

  console.log(`[booking] ${bookingRef(bookingId)} confirmed; notifications:`, JSON.stringify(results));

  try {
    await adminDb()
      .collection("bookings")
      .doc(bookingId)
      .update({
        notify: results,
        // WhatsApp click-to-chat texts, used by the "Send confirmation" buttons in the dashboard
        whatsappConfirmationMessage: generateBookingConfirmationWhatsApp(info),
        ownerNotificationMessage: generateOwnerNotificationWhatsApp(info),
        updatedAtMs: Date.now(),
      });
  } catch (e) {
    console.error("[notify] could not save notification status:", (e as Error)?.message);
  }
}

/** Dashboard "Resend SMS" button. */
export async function resendGuestSms(bookingId: string): Promise<{ ok: boolean; detail?: string }> {
  const ref = adminDb().collection("bookings").doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, detail: "Booking not found." };
  const b = snap.data() as DocumentData;
  if (b.paymentStatus !== "paid") return { ok: false, detail: "Only paid bookings can be confirmed." };
  if (!b.guestPhone) return { ok: false, detail: "This booking has no phone number." };
  if (!smsConfigured()) return { ok: false, detail: "SMS isn't set up yet (see SETUP.md)." };

  const res = await sendSms(b.guestPhone, guestSms(infoFrom(bookingId, b, b.mpesaReceipt ?? null)));
  await ref.update({ "notify.guestSms": res.ok ? "sent" : "failed", updatedAtMs: Date.now() }).catch(() => {});
  return { ok: res.ok, detail: res.ok ? undefined : res.detail || "SMS failed." };
}
