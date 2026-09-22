import { Elysia, t } from "elysia";
import { TransactionModel } from "../types";
import type { IncomeSummary } from "@spendtrackiq/shared";
import { requireAuth } from "../plugins/authPlugin";

export const incomeRoute = new Elysia()
  .use(requireAuth)
  .get(
    "/income/summary/:year",
    async (context): Promise<IncomeSummary[]> => {
      const { params, userId } = context as any;
      const year = parseInt(params.year, 10);
      const startDate = `${year}-01-01`;
      const endDate = `${year + 1}-01-01`;

      const results = await TransactionModel.aggregate([
        {
          $match: {
            userId,
            type: "credit",
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

  .get(
    "/income/aggregates",
    async (context) => {
      const { query, userId } = context as any;

      const dateFilter: Record<string, unknown> = {};
      if (query.dateFrom || query.dateTo) {
        if (query.dateFrom) dateFilter.$gte = query.dateFrom;
        if (query.dateTo) dateFilter.$lte = query.dateTo;
      } else if (query.year) {
        const year = parseInt(query.year, 10);
        dateFilter.$gte = `${year}-01-01`;
        dateFilter.$lt = `${year + 1}-01-01`;
      }

      const match: Record<string, unknown> = { userId };
      if (Object.keys(dateFilter).length > 0) {
        match.date = dateFilter;
      }

      const results = await TransactionModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalCredit: {
              $sum: {
                $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
              },
            },
            totalDebit: {
              $sum: {
                $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
              },
            },
            totalTransactions: { $sum: 1 },
          },
        },
      ]);

      const data = results[0] || { totalCredit: 0, totalDebit: 0, totalTransactions: 0 };
      return {
        totalCredit: data.totalCredit,
        totalDebit: data.totalDebit,
        netIncome: data.totalCredit - data.totalDebit,
        totalTransactions: data.totalTransactions,
      };
    },
    {
      query: t.Optional(
        t.Object({
          year: t.Optional(t.String()),
          dateFrom: t.Optional(t.String()),
          dateTo: t.Optional(t.String()),
        })
      ),
    }
  )

  .get(
    "/transactions",
    async (context) => {
      const { query, userId } = context as any;
      const filter: Record<string, unknown> = { userId };

      if (query.dateFrom || query.dateTo) {
        const dateFilter: Record<string, unknown> = {};
        if (query.dateFrom) dateFilter.$gte = query.dateFrom;
        if (query.dateTo) dateFilter.$lte = query.dateTo;
        filter.date = dateFilter;
      } else if (query.year) {
        const year = parseInt(query.year, 10);
        filter.date = { $gte: `${year}-01-01`, $lt: `${year + 1}-01-01` };
      }

      if (query.category) {
        filter.category = query.category;
      }

      if (query.bank) {
        filter.bank = query.bank;
      }

      if (query.uploadId) {
        filter.uploadId = query.uploadId;
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
          dateFrom: t.Optional(t.String()),
          dateTo: t.Optional(t.String()),
          category: t.Optional(t.String()),
          bank: t.Optional(t.String()),
          uploadId: t.Optional(t.String()),
        })
      ),
    }
  )

  .patch(
    "/transactions/:id",
    async (context) => {
      const { params, body, set, userId } = context as any;
      const { category } = body;
      const validCategories = ["income", "expense", "transfer", "uncategorized"];

      if (!validCategories.includes(category)) {
        set.status = 400;
        return {
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
        };
      }

      const updated = await TransactionModel.findOneAndUpdate(
        { _id: params.id, userId },
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
