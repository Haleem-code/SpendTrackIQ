import { Elysia } from "elysia";
import type { UploadRecord } from "@haleem/shared";
import { UploadModel } from "../types";
import { sendWhatsAppReminder } from "../lib/whatsapp";
import { sendEmailReminder } from "../lib/email";

/**
 * POST /reminder/send
 *
 * Triggered by GitHub Actions weekly cron.
 * - Validates x-cron-secret header against CRON_SECRET env var.
 * - Checks the most recent upload record.
 * - If 7+ days since last upload, sends WhatsApp (primary) + email (secondary).
 */
export const reminderRoute = new Elysia({ prefix: "/reminder" }).post(
  "/send",
  async ({ headers, set }) => {
    // ── Auth: validate cron secret ────────────────────────────────────────
    const secret = headers["x-cron-secret"];
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      set.status = 401;
      return { success: false, message: "Unauthorized." };
    }

    // ── Check last upload ─────────────────────────────────────────────────
    const lastUpload = (await UploadModel.findOne()
      .sort({ uploadedAt: -1 })
      .lean()) as UploadRecord | null;

    const daysSinceUpload = lastUpload
      ? Math.floor(
          (Date.now() - new Date(lastUpload.uploadedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : Infinity; // never uploaded

    if (daysSinceUpload < 7) {
      return {
        success: true,
        message: `Last upload was ${daysSinceUpload} day(s) ago. No reminder needed.`,
        reminded: false,
      };
    }

    // ── Send reminders ────────────────────────────────────────────────────
    const phone = process.env.HALEEM_PHONE;
    const email = process.env.HALEEM_EMAIL;
    const webUrl = process.env.WEB_URL ?? "https://haleem-income-tracker.vercel.app";

    const errors: string[] = [];

    // WhatsApp (primary)
    if (phone) {
      try {
        await sendWhatsAppReminder(phone, daysSinceUpload, webUrl);
      } catch (err) {
        errors.push(`WhatsApp failed: ${(err as Error).message}`);
      }
    }

    // Email (secondary)
    if (email) {
      try {
        await sendEmailReminder(email, daysSinceUpload, webUrl);
      } catch (err) {
        errors.push(`Email failed: ${(err as Error).message}`);
      }
    }

    if (errors.length > 0) {
      set.status = 207; // multi-status
      return {
        success: false,
        message: "Some reminders failed.",
        errors,
        reminded: true,
      };
    }

    return {
      success: true,
      message: `Reminder sent! Last upload was ${daysSinceUpload === Infinity ? "never" : `${daysSinceUpload} days ago`}.`,
      reminded: true,
    };
  }
);
