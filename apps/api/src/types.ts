import mongoose, { Schema, type Document } from "mongoose";
import type { Transaction, UploadRecord } from "@haleem/shared";

// ─── Transaction Model ────────────────────────────────────────────────────────

export interface TransactionDocument extends Omit<Transaction, "_id">, Document {}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    date: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    bank: { type: String, enum: ["gtbank", "opay"], required: true },
    category: {
      type: String,
      enum: ["income", "expense", "transfer", "uncategorized"],
      default: "uncategorized",
      required: true,
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ date: 1, bank: 1 });
TransactionSchema.index({ category: 1 });

export const TransactionModel =
  mongoose.models.Transaction ??
  mongoose.model<TransactionDocument>("Transaction", TransactionSchema);

// ─── Upload Record Model ──────────────────────────────────────────────────────

export interface UploadDocument extends Omit<UploadRecord, "_id">, Document {}

const UploadSchema = new Schema<UploadDocument>(
  {
    bank: { type: String, enum: ["gtbank", "opay"], required: true },
    uploadedAt: { type: String, required: true },
    transactionCount: { type: Number, required: true },
  },
  { timestamps: true }
);

UploadSchema.index({ uploadedAt: -1 });

export const UploadModel =
  mongoose.models.Upload ??
  mongoose.model<UploadDocument>("Upload", UploadSchema);
