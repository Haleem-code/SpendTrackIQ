import pdfParse from "pdf-parse";
import type { Transaction } from "@spendtrackiq/shared";
import { classifyTransaction } from "./classify";

export async function parseStatement(
  buffer: Buffer,
  bankInput: string,
  filename: string
): Promise<{ transactions: Omit<Transaction, "userId" | "_id">[], bank: string }> {
  let rawText = "";

  if (filename.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    rawText = data.text;
  } else if (filename.endsWith(".csv")) {
    rawText = buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or CSV file.");
  }

  const transactions = parseUniversalStatement(rawText, filename);

  const processed = transactions.map((t) => ({
    ...t,
    category: classifyTransaction(t),
  }));

  // Attempt to guess the bank name from text if possible, otherwise generic
  let bankName = "Unknown Bank";
  const textLower = rawText.toLowerCase();
  if (textLower.includes("gtbank") || textLower.includes("guaranty trust")) {
    bankName = "GTBank";
  } else if (textLower.includes("opay") || textLower.includes("paycom")) {
    bankName = "OPay";
  } else if (textLower.includes("zenith")) {
    bankName = "Zenith Bank";
  } else if (textLower.includes("access")) {
    bankName = "Access Bank";
  } else if (textLower.includes("uba") || textLower.includes("united bank for africa")) {
    bankName = "UBA";
  } else if (textLower.includes("first bank")) {
    bankName = "First Bank";
  } else {
    bankName = "Auto Bank";
  }

  return { transactions: processed, bank: bankName };
}

function parseUniversalStatement(text: string, filename: string): Omit<Transaction, "userId" | "_id">[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const transactions: Omit<Transaction, "userId" | "_id">[] = [];

  const datePattern = /(\d{4}-\d{2}-\d{2}|\d{1,2}[-/]\d{2}[-/]\d{4}|\d{1,2}[-/]\w{3}[-/]\d{4})/;
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

    const lowerLine = line.toLowerCase();
    let type: "credit" | "debit" = "debit";
    let amount = amounts[0];

    if (lowerLine.includes("+") || lowerLine.includes("credit") || lowerLine.includes("cr")) {
      type = "credit";
    } else if (lowerLine.includes("-") || lowerLine.includes("debit") || lowerLine.includes("dr")) {
      type = "debit";
    } else if (amounts.length >= 3) {
      // Common pattern: [debit, credit, balance]
      const debit = amounts[amounts.length - 3];
      const credit = amounts[amounts.length - 2];
      if (credit > 0) {
        type = "credit";
        amount = credit;
      } else {
        type = "debit";
        amount = debit;
      }
    }

    const dateEnd = line.indexOf(rawDate) + rawDate.length;
    let description = line
      .substring(dateEnd)
      .replace(amountPattern, "")
      .replace(/\b(credit|debit|cr|dr)\b/gi, "")
      .replace(/[+-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (amount === 0) continue;

    transactions.push({
      date,
      description: description || "Bank transaction",
      amount,
      type,
      bank: "Auto Bank", // gets overridden in parseStatement
      category: "uncategorized",
    });
  }

  return transactions;
}

function normalizeDate(raw: string): string | null {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const monMatch = raw.match(/^(\d{1,2})[-/](\w{3})[-/](\d{4})$/);
    if (monMatch) {
      const d = new Date(`${monMatch[2]} ${monMatch[1]}, ${monMatch[3]}`);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }

    const slashMatch = raw.match(/^(\d{1,2})[-/](\d{2})[-/](\d{4})$/);
    if (slashMatch) {
      const d = new Date(`${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }

    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

    return null;
  } catch {
    return null;
  }
}
