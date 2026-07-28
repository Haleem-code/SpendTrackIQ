"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface IncomeSummary {
  month: number;
  year: number;
  bank: "gtbank" | "opay";
  total: number;
}

interface TransactionRow {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  bank: "gtbank" | "opay";
  category: "income" | "expense" | "transfer" | "uncategorized";
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [summaries, setSummaries] = useState<IncomeSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([
        fetch(`${API_URL}/income/summary/${year}`),
        fetch(`${API_URL}/transactions?year=${year}`),
      ]);
      const sumData = await sumRes.json();
      const txData = await txRes.json();
      setSummaries(Array.isArray(sumData) ? sumData : []);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalIncome = summaries.reduce((s, r) => s + r.total, 0);

  const gtbankIncome = summaries
    .filter((r) => r.bank === "gtbank")
    .reduce((s, r) => s + r.total, 0);

  const opayIncome = summaries
    .filter((r) => r.bank === "opay")
    .reduce((s, r) => s + r.total, 0);

  const totalTransactions = transactions.length;

  const uncategorizedCount = transactions.filter(
    (t) => t.category === "uncategorized"
  ).length;

  // ── Monthly breakdown rows ────────────────────────────────────────────────
  const monthlyRows = MONTHS.map((name, i) => {
    const monthNum = i + 1;
    const gtb = summaries.find((s) => s.month === monthNum && s.bank === "gtbank")?.total ?? 0;
    const opay = summaries.find((s) => s.month === monthNum && s.bank === "opay")?.total ?? 0;
    return { name, gtb, opay, total: gtb + opay };
  });

  // ── Filtered transactions ─────────────────────────────────────────────────
  const filteredTx =
    txFilter === "all"
      ? transactions.slice(0, 50)
      : transactions.filter((t) => t.category === txFilter).slice(0, 50);

  // ── Recategorize handler ──────────────────────────────────────────────────
  const handleRecategorize = async (id: string, category: string) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      // Refresh
      fetchData();
    } catch (err) {
      console.error("Failed to recategorize:", err);
    }
  };

  // ── Year options ──────────────────────────────────────────────────────────
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <main className="fade-in" style={{ paddingBottom: "64px" }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: "24px" }}>
        <h1 className="section-title" style={{ fontSize: "1.5rem" }}>
          📊 Dashboard
        </h1>
        <select
          id="year-selector"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="card fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="card-title">Total Income ({year})</div>
          <div className="card-value success">
            {loading ? "..." : fmt(totalIncome)}
          </div>
        </div>

        <div className="card fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="card-title">GTBank Income</div>
          <div className="card-value" style={{ fontSize: "1.5rem" }}>
            {loading ? "..." : fmt(gtbankIncome)}
          </div>
          <span className="badge gtbank" style={{ marginTop: "8px" }}>
            GTBank
          </span>
        </div>

        <div className="card fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="card-title">OPay Income</div>
          <div className="card-value" style={{ fontSize: "1.5rem" }}>
            {loading ? "..." : fmt(opayIncome)}
          </div>
          <span className="badge opay" style={{ marginTop: "8px" }}>
            OPay
          </span>
        </div>

        <div className="card fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="card-title">Transactions</div>
          <div className="card-value" style={{ fontSize: "1.5rem" }}>
            {loading ? "..." : totalTransactions}
          </div>
          {uncategorizedCount > 0 && (
            <span className="badge uncategorized" style={{ marginTop: "8px" }}>
              {uncategorizedCount} to review
            </span>
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="section-header">
        <h2 className="section-title">Monthly Breakdown</h2>
      </div>
      <div
        className="table-wrapper fade-in"
        style={{ marginBottom: "32px", animationDelay: "0.25s" }}
      >
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>GTBank</th>
              <th>OPay</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "32px" }}>
                  Loading...
                </td>
              </tr>
            ) : monthlyRows.every((r) => r.total === 0) ? (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <div className="icon">📭</div>
                    <p>No income data for {year}. Upload a statement to get started.</p>
                    <a href="/upload" className="btn btn-primary">
                      Upload Statement
                    </a>
                  </div>
                </td>
              </tr>
            ) : (
              monthlyRows.map((row) => (
                <tr key={row.name}>
                  <td style={{ fontWeight: 600, color: "var(--text)" }}>
                    {row.name}
                  </td>
                  <td>{row.gtb > 0 ? fmt(row.gtb) : "—"}</td>
                  <td>{row.opay > 0 ? fmt(row.opay) : "—"}</td>
                  <td style={{ fontWeight: 600, color: row.total > 0 ? "var(--success)" : "var(--text-muted)" }}>
                    {row.total > 0 ? fmt(row.total) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <div className="section-header">
        <h2 className="section-title">Transactions</h2>
        <select
          id="category-filter"
          value={txFilter}
          onChange={(e) => setTxFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
          <option value="uncategorized">Uncategorized</option>
        </select>
      </div>
      <div
        className="table-wrapper fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Bank</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px" }}>
                  Loading...
                </td>
              </tr>
            ) : filteredTx.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="icon">🔍</div>
                    <p>No transactions found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTx.map((tx) => (
                <tr key={tx._id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(tx.date).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td
                    style={{
                      maxWidth: "260px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={tx.description}
                  >
                    {tx.description}
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: tx.type === "credit" ? "var(--success)" : "var(--danger)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.type === "credit" ? "+" : "−"}
                    {fmt(tx.amount)}
                  </td>
                  <td>
                    <span className={`badge ${tx.bank}`}>
                      {tx.bank === "gtbank" ? "GTBank" : "OPay"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${tx.category}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td>
                    <select
                      value={tx.category}
                      onChange={(e) => handleRecategorize(tx._id, e.target.value)}
                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="transfer">Transfer</option>
                      <option value="uncategorized">Uncategorized</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
