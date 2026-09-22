"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Trash2, Calendar, FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const getAuthToken = () => {
  if (typeof document === "undefined") return null;
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

export default function StatementsPage() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/statements/uploads`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch statements");
      }

      const data = await res.json();
      setUploads(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this statement and all its transactions? This action cannot be undone.")) {
      return;
    }

    setDeleting(id);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/statements/uploads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete statement");
      }
      
      setUploads((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Statements</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>Manage your uploaded bank statements</p>
        </div>
        <a href="/upload" className="btn btn-primary">
          <FileUp size={16} />
          Upload New
        </a>
      </div>

      {error && (
        <div className="alert error" style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Upload History</div>
          <div className="badge">{uploads.length} Records</div>
        </div>
        
        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state">
              <div style={{ opacity: 0.5, marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <FileText size={32} />
              </div>
              Loading statements...
            </div>
          ) : uploads.length === 0 ? (
            <div className="empty-state">
              <div style={{ opacity: 0.5, marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <FileText size={32} />
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>No Statements Found</h3>
              <p style={{ marginBottom: "16px" }}>You haven't uploaded any bank statements yet.</p>
              <a href="/upload" className="btn btn-primary">
                Upload your first statement
              </a>
            </div>
          ) : (
            <div className="tx-list">
              {uploads.map((upload) => (
                <div key={upload._id} className="statement-row">
                  <div className="statement-row-header" style={{ cursor: "default", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
                      <div className="tx-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)", borderColor: "rgba(34,197,94,0.2)", width: "36px", height: "36px" }}>
                        {upload.bank === "gtbank" ? "GT" : "OP"}
                      </div>
                      <div className="tx-details">
                        <div className="tx-desc" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                          {upload.filename || `${upload.bank.toUpperCase()} Statement`}
                        </div>
                        <div className="tx-meta" style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px", flexWrap: "wrap" }}>
                          <span className={`badge ${upload.bank}`}>{upload.bank}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} />
                            {new Date(upload.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={12} color="var(--success)" />
                            {upload.transactionCount} TXs Extracted
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: "8px 14px", color: "var(--danger)", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }}
                        onClick={() => handleDelete(upload._id)}
                        disabled={deleting === upload._id}
                      >
                        {deleting === upload._id ? "Deleting..." : <><Trash2 size={14} /> Delete</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
