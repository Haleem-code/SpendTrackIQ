import { Elysia, t } from "elysia";
import { parseStatement } from "../lib/parseStatement";
import { TransactionModel, UploadModel } from "../types";

import { requireAuth } from "../plugins/authPlugin";

export const uploadRoute = new Elysia({ prefix: "/statements" })
  .use(requireAuth)
  .post(
    "/upload",
    async (context) => {
      const { body, query, set, userId } = context as any;
      try {
        const bankInput = query.bank as string;

        if (!bankInput) {
          set.status = 400;
          return { success: false, message: "Query param 'bank' is required." };
        }

        const { file } = body;

        if (!file) {
          set.status = 400;
          return { success: false, message: "No file provided." };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { transactions, bank } = await parseStatement(buffer, bankInput as any, file.name);

        // Create upload record first so we can reference its ID
        const uploadRecord = await UploadModel.create({
          userId,
          bank,
          uploadedAt: new Date().toISOString(),
          transactionCount: transactions.length,
          filename: file.name,
        });

        const transactionsWithUser = transactions.map((t) => ({
          ...t,
          userId,
          uploadId: uploadRecord._id.toString(),
        }));

        if (transactionsWithUser.length === 0) {
          // Delete the upload record if no transactions were parsed
          await UploadModel.findByIdAndDelete(uploadRecord._id);
          set.status = 422;
          return {
            success: false,
            message: "No transactions could be extracted from this file. Check that it's a valid bank statement.",
          };
        }

        await TransactionModel.insertMany(transactionsWithUser);

        return {
          success: true,
          message: `Parsed and stored ${transactionsWithUser.length} transactions from ${bank}.`,
          transactionCount: transactionsWithUser.length,
        };
      } catch (err) {
        set.status = 500;
        return { success: false, message: (err as Error).message };
      }
    },
    {
      query: t.Object({
        bank: t.String(),
      }),
      body: t.Object({
        file: t.File({ type: ["application/pdf", "text/csv"] }),
      }),
    }
  )
  .get("/uploads", async (context) => {
    const { userId } = context as any;
    try {
      const records = await UploadModel.find({ userId }).sort({ uploadedAt: -1 }).limit(50).lean();
      return records;
    } catch (err) {
      return [];
    }
  })
  .get("/uploads/activity", async (context) => {
    const { userId } = context as any;
    try {
      // Get upload activity for the last 52 weeks (364 days)
      const since = new Date();
      since.setDate(since.getDate() - 364);
      const sinceISO = since.toISOString();

      const records = await UploadModel.find({
        userId,
        uploadedAt: { $gte: sinceISO },
      }).lean();

      // Build a map of date -> total transaction count
      const activity: Record<string, number> = {};
      for (const rec of records) {
        const day = (rec as any).uploadedAt.slice(0, 10); // "YYYY-MM-DD"
        activity[day] = (activity[day] || 0) + ((rec as any).transactionCount || 0);
      }

      return activity;
    } catch (err) {
      return {};
    }
  })
  .delete("/uploads", async (context) => {
    const { userId } = context as any;
    try {
      await UploadModel.deleteMany({ userId });
      await TransactionModel.deleteMany({ userId });
      return { success: true, message: "All statements and transactions have been deleted." };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  })
  .delete("/uploads/:id", async (context) => {
    const { userId, params } = context as any;
    try {
      const upload = await UploadModel.findOneAndDelete({ _id: params.id, userId });
      if (!upload) {
        return { success: false, message: "Upload not found." };
      }
      await TransactionModel.deleteMany({ uploadId: params.id, userId });
      return { success: true, message: "Statement deleted successfully." };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  });
