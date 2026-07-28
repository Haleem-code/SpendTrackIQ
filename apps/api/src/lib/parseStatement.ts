import pdfParse from "pdf-parse";
import type { Transaction, Bank } from "@haleem/shared";
import { classifyTransaction } from "./classify";

/**
 * Parse a bank statement PDF/CSV and return classified transactions.
 * Does NOT persist to DB — that's the upload route's job.
 */
export async function parseStatement(
  buffer: Buffer,
  bank: Bank,
  filename: string
): Promise<Transaction[]> {
  let rawText = "";

  if (filename.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    rawText = data.text;
  } else if (filename.endsWith(".csv")) {
    rawText = buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or CSV file.");
  }

  let transactions: Transaction[];

  if (bank === "gtbank") {
    transactions = parseGTBankStatement(rawText, bank);
  } else if (bank === "opay") {
    transactions = parseOPayStatement(rawText, bank);
  } else {
    throw new Error(`Unknown bank: ${bank}`);
  }

  // Classify each transaction
  return transactions.map((t) => ({
    ...t,
    category: classifyTransaction(t),
  }));
}

// ─── GTBank Parser ────────────────────────────────────────────────────────────
/**
 * GTBank PDF statements are text-based, column-oriented.
 *
 * Typical layout (columns separated by whitespace):
 *   Trans Date | Value Date | Reference | Description | Debit | Credit | Balance
 *
 * Example line:
 *   01-Jul-2024  01-Jul-2024  TRF/xxxx  Salary Payment  0.00  250,000.00  500,000.00
 *
 * The regex below captures:
 *   - Date (DD-Mon-YYYY or DD/MM/YYYY)
 *   - Description (middle text)
 *   - Debit amount
 *   - Credit amount
 */
function parseGTBankStatement(text: string, bank: Bank): Transaction[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const transactions: Transaction[] = [];

  // GTBank date pattern: DD-Mon-YYYY or DD/MM/YYYY
  const datePattern =
    /(\d{1,2}[-/]\w{3}[-/]\d{4}|\d{1,2}[-/]\d{2}[-/]\d{4})/;

  // Amount pattern: matches numbers like 1,000.00 or 1000.00
  const amountPattern = /[\d,]+\.\d{2}/g;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const rawDate = dateMatch[1];
    const date = normalizeDate(rawDate);
    if (!date) continue;

    // Extract all amounts from the line
    const amounts = [...line.matchAll(amountPattern)].map((m) =>
      parseFloat(m[0].replace(/,/g, ""))
    );

    if (amounts.length < 2) continue; // need at least debit + credit columns

    // In GTBank layout the last amount is typically balance,
    // second-to-last and third-to-last are credit and debit.
    // If there are exactly 3 amounts: [debit, credit, balance]
    // If debit is 0, it's a credit transaction, and vice versa.

    let debit = 0;
    let credit = 0;

    if (amounts.length >= 3) {
      debit = amounts[amounts.length - 3];
      credit = amounts[amounts.length - 2];
    } else {
      // Fallback: first is debit/credit, second is balance
      debit = amounts[0];
    }

    const amount = credit > 0 ? credit : debit;
    const type = credit > 0 ? "credit" : "debit";

    // Extract description: text between the date(s) and the first amount
    const dateEnd = line.indexOf(rawDate) + rawDate.length;
    const firstAmountIdx = line.indexOf(amounts[0].toLocaleString("en", { minimumFractionDigits: 2 }));
    let description = line
      .substring(dateEnd, firstAmountIdx > dateEnd ? firstAmountIdx : undefined)
      .replace(/\s+/g, " ")
      .trim();

    // Remove a possible second date (value date) from description start
    description = description.replace(datePattern, "").trim();

    if (amount === 0) continue;

    transactions.push({
      date,
      description: description || "GTBank transaction",
      amount,
      type,
      bank,
      category: "uncategorized",
    });
  }

  return transactions;
}

// ─── OPay Parser ──────────────────────────────────────────────────────────────
/**
 * OPay PDF statements are text-based, column-oriented.
 *
 * Typical layout:
 *   Date | Description | Amount | Type | Balance
 *
 * Or sometimes:
 *   Transaction Date | Details | Debit | Credit | Running Balance
 *
 * The parser uses a similar heuristic to GTBank but adjusted for OPay's
 * layout variations.
 */
function parseOPayStatement(text: string, bank: Bank): Transaction[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const transactions: Transaction[] = [];

  // OPay uses various date formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  const datePattern =
    /(\d{4}-\d{2}-\d{2}|\d{1,2}[-/]\d{2}[-/]\d{4})/;

  const amountPattern = /[\d,]+\.\d{2}/g;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const rawDate = dateMatch[1];
    const date = normalizeDate(rawDate);
    if (!date) continue;

    const amounts = [...line.matchAll(amountPattern)].map((m) =>
      parseFloat(m[0].replace(/,/g, ""))
    );

    if (amounts.length < 1) continue;

    // Determine credit vs debit
    const lowerLine = line.toLowerCase();
    let type: "credit" | "debit" = "debit";
    let amount = amounts[0];

    if (lowerLine.includes("credit") || lowerLine.includes("cr")) {
      type = "credit";
    } else if (lowerLine.includes("debit") || lowerLine.includes("dr")) {
      type = "debit";
    } else if (amounts.length >= 3) {
      // [debit, credit, balance] pattern
      const debit = amounts[amounts.length - 3];
      const credit = amounts[amounts.length - 2];
      type = credit > 0 ? "credit" : "debit";
      amount = credit > 0 ? credit : debit;
    }

    // Extract description
    const dateEnd = line.indexOf(rawDate) + rawDate.length;
    let description = line
      .substring(dateEnd)
      .replace(amountPattern, "")
      .replace(/\b(credit|debit|cr|dr)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (amount === 0) continue;

    transactions.push({
      date,
      description: description || "OPay transaction",
      amount,
      type,
      bank,
      category: "uncategorized",
    });
  }

  return transactions;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize various date formats to ISO 8601 (YYYY-MM-DD).
 */
function normalizeDate(raw: string): string | null {
  try {
    // Already ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    // DD-Mon-YYYY (e.g. 01-Jul-2024)
    const monMatch = raw.match(
      /^(\d{1,2})-(\w{3})-(\d{4})$/
    );
    if (monMatch) {
      const d = new Date(`${monMatch[2]} ${monMatch[1]}, ${monMatch[3]}`);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const slashMatch = raw.match(
      /^(\d{1,2})[-/](\d{2})[-/](\d{4})$/
    );
    if (slashMatch) {
      const d = new Date(
        `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`
      );
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }

    // Fallback
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

    return null;
  } catch {
    return null;
  }
}
