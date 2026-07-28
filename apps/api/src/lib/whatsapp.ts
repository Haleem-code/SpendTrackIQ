/**
 * WhatsApp reminder via Twilio WhatsApp API.
 *
 * Uses a Content Template since reminders will almost always fall outside
 * the 24-hour free-form messaging window. Register a template like:
 *
 *   "You haven't tracked your income yet — upload now: {{1}}"
 *
 * In sandbox mode, the recipient must have sent "join <sandbox-keyword>"
 * to the Twilio sandbox number first.
 */
export async function sendWhatsAppReminder(
  phoneNumber: string,
  daysSinceUpload: number,
  webUrl: string
): Promise<void> {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886"; // sandbox default

  // ── Dev stub ────────────────────────────────────────────────────────────
  if (!accountSid || !authToken) {
    const daysText =
      daysSinceUpload === Infinity ? "never" : `${daysSinceUpload} days ago`;
    console.log(
      `📱 [WhatsApp STUB] Would send to ${phoneNumber}: ` +
        `"Last upload: ${daysText}. Upload now: ${webUrl}/upload"`
    );
    return;
  }

  // ── Twilio API call ─────────────────────────────────────────────────────
  const daysText =
    daysSinceUpload === Infinity
      ? "You haven't uploaded any statements yet"
      : `It's been ${daysSinceUpload} days since your last upload`;

  const body = `📊 *Haleem's Income Tracker*\n\n${daysText}. Upload your GTBank/OPay statement now:\n${webUrl}/upload`;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: `whatsapp:${phoneNumber}`,
        Body: body,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio WhatsApp error: ${text}`);
  }

  console.log(`📱 WhatsApp reminder sent to ${phoneNumber}`);
}
