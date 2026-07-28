// ─── Shared Types — Haleem's Income Tracker ───────────────────────────────────

export type Bank = "gtbank" | "opay";

export type TransactionCategory =
  | "income"
  | "expense"
  | "transfer"
  | "uncategorized";

export interface Transaction {
  _id?: string;
  date: string; // ISO 8601
  description: string;
  amount: number;
  type: "credit" | "debit";
  bank: Bank;
  category: TransactionCategory;
}

export interface IncomeSummary {
  month: number; // 1–12
  year: number;
  bank: Bank;
  total: number;
}

export interface UploadRecord {
  _id?: string;
  bank: Bank;
  uploadedAt: string; // ISO 8601
  transactionCount: number;
}
