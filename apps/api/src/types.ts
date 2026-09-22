import mongoose, { Schema, type Document } from "mongoose";
import type { Transaction, UploadRecord, User } from "@spendtrackiq/shared";

export interface UserDocument extends Omit<User, "_id">, Document {
  passwordHash: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    notificationFrequency: { type: String, enum: ["weekly", "monthly", "none"], default: "weekly" },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);

export interface TransactionDocument extends Omit<Transaction, "_id">, Document {}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: String, required: true },
    uploadId: { type: String },
    date: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    bank: { type: String, required: true },
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
TransactionSchema.index({ uploadId: 1 });

export const TransactionModel =
  mongoose.models.Transaction ??
  mongoose.model<TransactionDocument>("Transaction", TransactionSchema);

export interface UploadDocument extends Omit<UploadRecord, "_id">, Document {}

const UploadSchema = new Schema<UploadDocument>(
  {
    userId: { type: String, required: true },
    bank: { type: String, required: true },
    uploadedAt: { type: String, required: true },
    transactionCount: { type: Number, required: true },
    filename: { type: String },
  },
  { timestamps: true }
);

UploadSchema.index({ uploadedAt: -1 });

export const UploadModel =
  mongoose.models.Upload ??
  mongoose.model<UploadDocument>("Upload", UploadSchema);
