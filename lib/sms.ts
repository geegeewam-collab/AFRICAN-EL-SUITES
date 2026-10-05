// Automatic SMS via Africa's Talking (works for all Kenyan networks).
// Needs AT_USERNAME + AT_API_KEY. Use AT_USERNAME=sandbox while testing (nothing is delivered).
export type SmsResult = { ok: boolean; skipped?: boolean; detail?: string };

export const smsConfigured = () => !!(process.env.AT_USERNAME && process.env.AT_API_KEY);

/** 07xx / 01xx / 2547xx / +2547xx  ->  +2547xxxxxxxx  (null if it isn't a Kenyan mobile) */
export function toE164(phone: string): string | null {
  const p = String(phone).replace(/[\s()+-]/g, "");
  if (/^254[17]\d{8}$/.test(p)) return `+${p}`;
  if (/^0[17]\d{8}$/.test(p)) return `+254${p.slice(1)}`;
  return null;
}

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;
  if (!username || !apiKey) return { ok: false, skipped: true, detail: "SMS not configured" };

  const number = toE164(to);
  if (!number) return { ok: false, detail: "Invalid phone number" };

  const host = username === "sandbox" ? "api.sandbox.africastalking.com" : "api.africastalking.com";
  const body = new URLSearchParams({ username, to: number, message });
  if (process.env.AT_SENDER_ID) body.set("from", process.env.AT_SENDER_ID);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://${host}/version1/messaging`, {
      method: "POST",
      headers: { apiKey, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: ctrl.signal,
    });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    const json = await res.json().catch(() => null);
    const rec = json?.SMSMessageData?.Recipients?.[0];
    // 100 = processed, 101 = sent, 102 = queued
    if (rec && [100, 101, 102].includes(Number(rec.statusCode))) return { ok: true, detail: rec.status };
    return { ok: false, detail: rec?.status || json?.SMSMessageData?.Message || "Rejected" };
  } catch (e) {
    return { ok: false, detail: (e as Error)?.name === "AbortError" ? "Timed out" : "Network error" };
  } finally {
    clearTimeout(timer);
  }
}
