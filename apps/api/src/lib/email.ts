import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmailReminder(
  recipientEmail: string,
  daysSinceUpload: number,
  webUrl: string
): Promise<void> {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const daysText =
    daysSinceUpload === Infinity
      ? "You haven't uploaded any bank statements yet"
      : `It's been ${daysSinceUpload} days since your last upload`;

  const { error } = await resend.emails.send({
    from: "SpendTrackIQ <onboarding@resend.dev>",
    to: recipientEmail,
    subject: "📊 Time to upload your bank statement!",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #0f0f13; color: #f1f0ff; border-radius: 16px;">
        <h2 style="color: #6c63ff; margin-bottom: 8px;">Hey there 👋</h2>
        <p style="color: #9ca3af; line-height: 1.6;">
          ${daysText}. Stay on top of your income tracking — upload your latest
          bank statement now.
        </p>
        <a href="${webUrl}/dashboard/upload"
           style="display: inline-block; margin-top: 20px; padding: 12px 24px;
                  background: linear-gradient(135deg, #6c63ff, #a78bfa);
                  color: #fff; text-decoration: none; border-radius: 8px;
                  font-weight: 600;">
          Upload Statement →
        </a>
        <p style="margin-top: 24px; color: #4b5563; font-size: 12px;">
          Sent by SpendTrackIQ
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`📧 Reminder email sent to ${recipientEmail}`);
}
