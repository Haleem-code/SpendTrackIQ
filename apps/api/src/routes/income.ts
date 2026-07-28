import { Elysia, t } from "elysia";
import { TransactionModel } from "../types";
import type { IncomeSummary } from "@haleem/shared";

export const incomeRoute = new Elysia()
  // ─── GET /income/summary/:year ────────────────────────────────────────────
  // Aggregate transactions where category === "income", grouped by month + bank.
  .get(
    "/income/summary/:year",
    async ({ params }): Promise<IncomeSummary[]> => {
      const year = parseInt(params.year, 10);
      const startDate = `${year}-01-01`;
      const endDate = `${year + 1}-01-01`;

      const results = await TransactionModel.aggregate([
        {
          $match: {
            category: "income",
            date: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $addFields: {
            monthNum: {
              $month: { $dateFromString: { dateString: "$date" } },
            },
          },
        },
        {
          $group: {
            _id: { month: "$monthNum", bank: "$bank" },
            total: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: { $literal: year },
            bank: "$_id.bank",
            total: 1,
          },
        },
        { $sort: { month: 1, bank: 1 } },
      ]);

      return results as IncomeSummary[];
    },
    {
      params: t.Object({ year: t.String() }),
    }
  )

  // ─── GET /transactions ────────────────────────────────────────────────────
  // List transactions with optional year + category filters for the review UI.
  .get(
    "/transactions",
    async ({ query }) => {
      const filter: Record<string, unknown> = {};

      if (query.year) {
        const year = parseInt(query.year, 10);
        filter.date = { $gte: `${year}-01-01`, $lt: `${year + 1}-01-01` };
      }

      if (query.category) {
        filter.category = query.category;
      }

      if (query.bank) {
        filter.bank = query.bank;
      }

      const transactions = await TransactionModel.find(filter)
        .sort({ date: -1 })
        .lean();

      return transactions;
    },
    {
      query: t.Optional(
        t.Object({
          year: t.Optional(t.String()),
          category: t.Optional(t.String()),
          bank: t.Optional(t.String()),
        })
      ),
    }
  )

  // ─── PATCH /transactions/:id ──────────────────────────────────────────────
  // Manually correct a transaction's category (ground truth override).
  .patch(
    "/transactions/:id",
    async ({ params, body, set }) => {
      const { category } = body;
      const validCategories = ["income", "expense", "transfer", "uncategorized"];

      if (!validCategories.includes(category)) {
        set.status = 400;
        return {
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
        };
      }

      const updated = await TransactionModel.findByIdAndUpdate(
        params.id,
        { $set: { category } },
        { new: true }
      ).lean();

      if (!updated) {
        set.status = 404;
        return { success: false, message: "Transaction not found." };
      }

      return { success: true, transaction: updated };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ category: t.String() }),
    }
  );
