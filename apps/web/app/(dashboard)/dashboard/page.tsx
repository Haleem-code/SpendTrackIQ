"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const getAuthToken = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

interface UploadRecord {
  _id: string;
  bank: "gtbank" | "opay";
  uploadedAt: string;
  transactionCount: number;
  filename?: string;
}

interface IncomeSummary {
  month: number;
  year: number;
  bank: "gtbank" | "opay";
  total: number;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(n);

type FilterPreset = "week" | "month" | "year" | "custom";

function getDateRange(preset: FilterPreset, year: number, customFrom?: string, customTo?: string) {
  const now = new Date();
  switch (preset) {
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { dateFrom: start.toISOString().slice(0, 10), dateTo: now.toISOString().slice(0, 10) };
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { dateFrom: start.toISOString().slice(0, 10), dateTo: now.toISOString().slice(0, 10) };
    }
    case "year": {
      return { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` };
    }
    case "custom": {
      return { dateFrom: customFrom || `${year}-01-01`, dateTo: customTo || now.toISOString().slice(0, 10) };
    }
  }
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [filterPreset, setFilterPreset] = useState<FilterPreset>("year");
  const [customFrom, setCustomFrom] = useState(`${currentYear}-01-01`);
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));

  const [aggregates, setAggregates] = useState({ totalCredit: 0, totalDebit: 0, netIncome: 0, totalTransactions: 0 });
  const [summaries, setSummaries] = useState<IncomeSummary[]>([]);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };
      const range = getDateRange(filterPreset, year, customFrom, customTo);

      const params = new URLSearchParams();
      if (range.dateFrom) params.set("dateFrom", range.dateFrom);
      if (range.dateTo) params.set("dateTo", range.dateTo);

      const [aggRes, sumRes, uploadRes] = await Promise.all([
        fetch(`${API_URL}/income/aggregates?${params.toString()}`, { headers }),
        fetch(`${API_URL}/income/summary/${year}`, { headers }),
        fetch(`${API_URL}/statements/uploads`, { headers }),
      ]);

      const aggData = await aggRes.json();
      const sumData = await sumRes.json();
      const uploadData = await uploadRes.json();

      setAggregates(aggData || { totalCredit: 0, totalDebit: 0, netIncome: 0, totalTransactions: 0 });
      setSummaries(Array.isArray(sumData) ? sumData : []);
      setUploads(Array.isArray(uploadData) ? uploadData : []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [year, filterPreset, customFrom, customTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthlyRows = MONTHS.map((name, i) => {
    const monthNum = i + 1;
    const gtb = summaries.find((s) => s.month === monthNum && s.bank === "gtbank")?.total ?? 0;
    const opay = summaries.find((s) => s.month === monthNum && s.bank === "opay")?.total ?? 0;
    return { name, total: gtb + opay };
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  let showReminder = false;
  if (!loading && uploads.length > 0) {
    const lastUpload = new Date(uploads[0].uploadedAt);
    const daysSince = (new Date().getTime() - lastUpload.getTime()) / (1000 * 3600 * 24);
    if (daysSince >= 7) showReminder = true;
  } else if (!loading && uploads.length === 0) {
    showReminder = true;
  }

  // Fire a browser notification for reminders
  useEffect(() => {
    if (showReminder && "Notification" in window && Notification.permission === "granted") {
      new Notification("SpendTrackIQ", {
        body: "You haven't uploaded a bank statement in a while. Keep your tracker up to date!",
        icon: "/logo.png",
      });
    }
  }, [showReminder]);

  const range = getDateRange(filterPreset, year, customFrom, customTo);
  const rangeLabel = filterPreset === "week" ? "Last 7 days"
    : filterPreset === "month" ? MONTHS[new Date().getMonth()] + " " + currentYear
    : filterPreset === "year" ? `${year}`
    : `${customFrom} → ${customTo}`;

  return (
    <div className="fade-in">
      {showReminder && (
        <div className="alert warning" style={{ marginBottom: "20px", background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)", color: "#f59e0b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span><strong>Reminder:</strong> You haven&apos;t uploaded a bank statement recently. Keep your tracker up to date!</span>
          <a href="/upload" className="btn btn-primary" style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#111", flexShrink: 0 }}>Upload Now</a>
        </div>
      )}

      {/* ── Filter Bar ─────────────────────────── */}
      <div className="filter-bar" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["week", "month", "year"] as FilterPreset[]).map((p) => (
            <button
              key={p}
              className={`btn ${filterPreset === p ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilterPreset(p)}
              style={{ textTransform: "capitalize", padding: "6px 14px", fontSize: "0.75rem" }}
            >
              {p === "week" ? "This Week" : p === "month" ? "This Month" : "Year"}
            </button>
          ))}
          <button
            className={`btn ${filterPreset === "custom" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterPreset("custom")}
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
          >
            Custom
          </button>
        </div>

        {filterPreset === "year" && (
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: "100px" }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        {filterPreset === "custom" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </div>
        )}
      </div>

      {/* ── Stats Cards ────────────────────────── */}
      <div className="dash-grid-top">
        <div className="card">
          <div className="card-title">
            <span>Net Income</span>
            <span className="badge">NGN</span>
          </div>
          <div className="card-value" style={{ color: aggregates.netIncome >= 0 ? "var(--success)" : "var(--danger)" }}>
            {loading ? "..." : fmt(aggregates.netIncome)}
          </div>
          <div className="card-trend neutral">{rangeLabel}</div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Total Inflow</span>
            <span className="badge success" style={{ borderColor: "rgba(34,197,94,0.3)", color: "#22c55e", background: "rgba(34,197,94,0.06)" }}>+ IN</span>
          </div>
          <div className="card-value" style={{ color: "var(--success)" }}>{loading ? "..." : fmt(aggregates.totalCredit)}</div>
          <div className="card-trend neutral">{rangeLabel}</div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Total Outflow</span>
            <span className="badge" style={{ borderColor: "rgba(248,113,113,0.3)", color: "#f87171", background: "rgba(248,113,113,0.06)" }}>- OUT</span>
          </div>
          <div className="card-value" style={{ color: "var(--danger)" }}>{loading ? "..." : fmt(aggregates.totalDebit)}</div>
          <div className="card-trend neutral">{rangeLabel}</div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Transactions</span>
            <span className="badge">TX</span>
          </div>
          <div className="card-value">{loading ? "..." : aggregates.totalTransactions}</div>
          <div className="card-trend neutral">{rangeLabel}</div>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────── */}
      <div className="dash-grid-main">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Annual Inflow</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div className="badge">YTD</div>
            </div>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "32px" }}>
              Total money received in each calendar month • {year}
            </p>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "8px", minHeight: "240px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              {monthlyRows.map((m) => {
                const max = Math.max(...monthlyRows.map(r => r.total), 1);
                const heightPct = (m.total / max) * 100;
                return (
                  <div key={m.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ 
                      width: "100%",
                      maxWidth: "32px",
                      height: `${Math.max(heightPct, 2)}%`, 
                      background: heightPct > 0 ? "var(--accent)" : "var(--border)",
                      opacity: heightPct > 0 ? 0.8 : 0.3,
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.3s"
                    }} />
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{m.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Recent Uploads (replaces Recent Transactions) ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <div className="panel-title">Recent Uploads</div>
              <a href="/statements" className="badge" style={{ cursor: "pointer", textDecoration: "none" }}>View All →</a>
            </div>
            <div className="panel-body" style={{ padding: "0 20px" }}>
              {loading ? (
                <div className="empty-state" style={{ padding: "32px 0" }}>Loading...</div>
              ) : uploads.length === 0 ? (
                <div className="empty-state" style={{ padding: "32px 0" }}>
                  No uploads yet.{" "}
                  <a href="/upload" style={{ color: "var(--accent)" }}>Upload your first statement →</a>
                </div>
              ) : (
                <div className="tx-list">
                  {uploads.slice(0, 6).map(up => (
                    <a className="tx-item" key={up._id} href="/statements" style={{ textDecoration: "none", cursor: "pointer" }}>
                      <div className="tx-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)", borderColor: "rgba(34,197,94,0.2)" }}>
                        {up.bank === "gtbank" ? "GT" : "OP"}
                      </div>
                      <div className="tx-details" style={{ flex: 1 }}>
                        <div className="tx-desc">{up.filename || new Date(up.uploadedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                        <div className="tx-meta">
                          {up.bank.toUpperCase()} • {new Date(up.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {up.transactionCount} TXs
                        </div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
                        View →
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
