import type { Transaction, TransactionCategory } from "@haleem/shared";

/**
 * Classify a transaction based on its description.
 *
 * Rules (in priority order):
 * 1. Description contains salary/payroll keywords → "income"
 * 2. Description matches own-account transfer patterns → "transfer"
 * 3. Everything else → "uncategorized"
 *
 * Manual corrections via PATCH /transactions/:id override this and are
 * treated as ground truth. Over time, add known client names / patterns
 * here to improve accuracy.
 */
export function classifyTransaction(tx: Transaction): TransactionCategory {
  const desc = tx.description.toLowerCase();

  // ── Income patterns ─────────────────────────────────────────────────────
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

  // ── Transfer-between-own-accounts patterns ──────────────────────────────
  const transferPatterns = [
    "transfer to self",
    "own account",
    "self transfer",
    "gtbank to opay",
    "opay to gtbank",
    // Add your own account numbers/names here for better matching:
    // "1234567890",
  ];

  if (transferPatterns.some((p) => desc.includes(p))) {
    return "transfer";
  }

  // ── Default ─────────────────────────────────────────────────────────────
  return "uncategorized";
}
