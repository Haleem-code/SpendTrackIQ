import type { Transaction, TransactionCategory } from "@spendtrackiq/shared";

export function classifyTransaction(tx: Omit<Transaction, "userId" | "_id">): TransactionCategory {
  const desc = tx.description.toLowerCase();

  const incomePatterns = [
    "salary",
    "payroll",
    "wage",
    "pay from",
    "monthly pay",
    "compensation",
    "stipend",
  ];

  if (incomePatterns.some((p) => desc.includes(p))) {
    return "income";
  }

  const transferPatterns = [
    "transfer to self",
    "own account",
    "self transfer",
    "gtbank to opay",
    "opay to gtbank",
  ];

  if (transferPatterns.some((p) => desc.includes(p))) {
    return "transfer";
  }

  return "uncategorized";
}
