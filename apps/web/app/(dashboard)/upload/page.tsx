"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, FileText } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const getAuthToken = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};


interface UploadResult {
  success: boolean;
  message: string;
  transactionCount?: number;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(isValidFile);
    if (dropped.length) {
      setFiles((prev) => [...prev, ...dropped].slice(0, 5));
      setResults([]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(isValidFile);
      if (selected.length) {
        setFiles((prev) => [...prev, ...selected].slice(0, 5));
        setResults([]);
      }
    }
  };

  const isValidFile = (f: File) =>
    f.type === "application/pdf" || f.name.endsWith(".csv");

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setResults([]);

    const token = getAuthToken();
    const newResults: UploadResult[] = [];

    for (const f of files) {
      try {
        const formData = new FormData();
        formData.append("file", f);

        const res = await fetch(`${API_URL}/statements/upload?bank=auto`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data: UploadResult = await res.json();
        newResults.push({
          success: data.success,
          message: `${f.name}: ${data.message}`,
          transactionCount: data.transactionCount,
        });
      } catch (err) {
        newResults.push({
          success: false,
          message: `${f.name}: Upload failed: ${(err as Error).message}`,
        });
      }
    }

    setResults(newResults);
    const allSuccess = newResults.every((r) => r.success);
    if (allSuccess) {
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
    }
    setUploading(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: "640px", margin: "0 auto" }}>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Upload Statement</div>
        </div>
        <div className="panel-body">
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.875rem" }}>
            Upload your bank statement (PDF or CSV) to automatically parse and track your income &amp; expenses.
          </p>

          {/* ── Results ─────────────────────── */}
          {results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {results.map((res, i) => (
                <div key={i} className={`alert ${res.success ? "success" : "error"} fade-in`}>
                  {res.success ? "✓" : "✗"} {res.message}
                  {res.transactionCount != null && (
                    <strong style={{ marginLeft: 8 }}>
                      ({res.transactionCount} TX)
                    </strong>
                  )}
                </div>
              ))}
            </div>
          )}


          {/* ── Drop Zone ──────────────────── */}
          <div
            className={`upload-zone ${dragging ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.csv"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
              <Upload size={40} style={{ color: "var(--accent)" }} />
            </div>

            {files.length > 0 ? (
              <div>
                <div className="label">{files.length} file{files.length > 1 ? "s" : ""} selected</div>
                <div className="hint">Max 5 files at a time</div>
              </div>
            ) : (
              <>
                <div className="label">Drop files or tap to browse</div>
                <div className="hint">PDF or CSV • Up to 5 files</div>
              </>
            )}
          </div>

          {/* ── File List ──────────────────── */}
          {files.length > 0 && (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {files.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", background: "var(--bg-2)", borderRadius: "var(--radius)",
                  border: "1px solid var(--border)"
                }}>
                  <FileText size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {(f.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", display: "flex", alignItems: "center" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Actions ────────────────────── */}
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              style={{
                flex: 1,
                minWidth: "150px",
                opacity: files.length === 0 || uploading ? 0.5 : 1,
                cursor: files.length === 0 || uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Processing..." : "Upload & Parse"}
            </button>
            {files.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setFiles([]);
                  setResults([]);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
