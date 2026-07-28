import { Elysia, t } from "elysia";
import { parseStatement } from "../lib/parseStatement";
import { TransactionModel, UploadModel } from "../types";
import type { Bank } from "@haleem/shared";

export const uploadRoute = new Elysia({ prefix: "/statements" }).post(
  "/upload",
  async ({ body, query, set }) => {
    try {
      const bank = query.bank as Bank;

      if (!bank || !["gtbank", "opay"].includes(bank)) {
        set.status = 400;
        return { success: false, message: "Query param 'bank' must be 'gtbank' or 'opay'." };
      }

      const { file } = body;

      if (!file) {
        set.status = 400;
        return { success: false, message: "No file provided." };
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const transactions = await parseStatement(buffer, bank, file.name);

      if (transactions.length === 0) {
        set.status = 422;
        return {
          success: false,
          message: "No transactions could be extracted from this file. Check that it's a valid bank statement.",
        };
      }

      // Bulk insert transactions
      await TransactionModel.insertMany(transactions);

      // Log the upload record
      await UploadModel.create({
        bank,
        uploadedAt: new Date().toISOString(),
        transactionCount: transactions.length,
      });

      return {
        success: true,
        message: `Parsed and stored ${transactions.length} transactions from ${bank}.`,
        transactionCount: transactions.length,
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
);
