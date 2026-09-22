export type TransactionCategory =
  | "income"
  | "expense"
  | "transfer"
  | "uncategorized";

export interface User {
  _id?: string;
  email: string;
  notificationFrequency?: "weekly" | "monthly" | "none";
}

export interface Transaction {
  _id?: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  bank: string;
  category: TransactionCategory;
  uploadId?: string;
}

export interface IncomeSummary {
  month: number;
  year: number;
  bank: string;
  total: number;
}

export interface UploadRecord {
  _id?: string;
  userId: string;
  bank: string;
  uploadedAt: string;
  transactionCount: number;
  filename?: string;
}
