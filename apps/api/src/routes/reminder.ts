import { Elysia } from "elysia";
import type { UploadRecord } from "@spendtrackiq/shared";
import { UploadModel, UserModel } from "../types";
import { sendEmailReminder } from "../lib/email";

export const reminderRoute = new Elysia({ prefix: "/reminder" }).post(
  "/send",
  async ({ headers, set }) => {
    const secret = headers["x-cron-secret"];
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      set.status = 401;
      return { success: false, message: "Unauthorized." };
    }

    const webUrl = process.env.WEB_URL ?? "https://spendtrackiq.vercel.app/";
    const errors: string[] = [];
    let remindedCount = 0;

    const users = await UserModel.find().lean();

    for (const user of users) {
      const lastUpload = (await UploadModel.findOne({ userId: (user as any)._id.toString() })
        .sort({ uploadedAt: -1 })
        .lean()) as UploadRecord | null;

      const daysSinceUpload = lastUpload
        ? Math.floor(
            (Date.now() - new Date(lastUpload.uploadedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : Infinity;

      if (daysSinceUpload >= 7) {
        try {
          await sendEmailReminder(user.email, daysSinceUpload, webUrl);
          remindedCount++;
        } catch (err) {
          errors.push(`Email to ${user.email} failed: ${(err as Error).message}`);
        }
      }
    }

    if (errors.length > 0) {
      set.status = 207;
      return {
        success: false,
        message: "Some reminders failed.",
        errors,
        remindedCount,
      };
    }

    return {
      success: true,
      message: `Reminders sent to ${remindedCount} users.`,
      remindedCount,
    };
  }
);
