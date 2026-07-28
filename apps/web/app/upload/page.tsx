"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Bank = "gtbank" | "opay";

interface UploadResult {
  success: boolean;
  message: string;
  transactionCount?: number;
}

export default function UploadPage() {
  const [bank, setBank] = useState<Bank>("gtbank");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isValidFile(dropped)) {
      setFile(dropped);
      setResult(null);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isValidFile(selected)) {
      setFile(selected);
      setResult(null);
    }
  };

  const isValidFile = (f: File) =>
    f.type === "application/pdf" || f.name.endsWith(".csv");

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/statements/upload?bank=${bank}`, {
        method: "POST",
        body: formData,
      });

      const data: UploadResult = await res.json();
      setResult(data);

      if (data.success) {
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err) {
      setResult({
        success: false,
        message: `Upload failed: ${(err as Error).message}`,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="fade-in" style={{ paddingBottom: "64px", maxWidth: "640px" }}>
      <h1
        className="section-title"
        style={{ fontSize: "1.5rem", marginBottom: "8px" }}
      >
        📤 Upload Statement
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        Upload your monthly GTBank or OPay bank statement (PDF) to automatically
        parse and track your income.
      </p>

      {/* Result alert */}
      {result && (
        <div className={`alert ${result.success ? "success" : "error"} fade-in`}>
          {result.success ? "✅" : "❌"} {result.message}
          {result.transactionCount != null && (
            <strong style={{ marginLeft: 4 }}>
              ({result.transactionCount} transactions)
            </strong>
          )}
        </div>
      )}

      {/* Bank selector */}
      <div style={{ marginBottom: "8px" }}>
        <div className="card-title">Select Bank</div>
      </div>
      <div className="bank-selector">
        <button
          type="button"
          className={`bank-option ${bank === "gtbank" ? "selected" : ""}`}
          onClick={() => setBank("gtbank")}
          id="bank-gtbank"
        >
          <div style={{ fontSize: "1.8rem" }}>🏦</div>
          <div className="bank-name" style={{ color: "#ff8800" }}>
            GTBank
          </div>
        </button>
        <button
          type="button"
          className={`bank-option ${bank === "opay" ? "selected" : ""}`}
          onClick={() => setBank("opay")}
          id="bank-opay"
        >
          <div style={{ fontSize: "1.8rem" }}>💚</div>
          <div className="bank-name" style={{ color: "#00c48f" }}>
            OPay
          </div>
        </button>
      </div>

      {/* Upload zone */}
      <div
        className={`upload-zone ${dragging ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        id="upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          id="file-input"
        />
        <div className="icon">📄</div>
        {file ? (
          <>
            <div className="label">{file.name}</div>
            <div className="hint">
              {(file.size / 1024).toFixed(1)} KB •{" "}
              <span className={`badge ${bank}`}>
                {bank === "gtbank" ? "GTBank" : "OPay"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="label">
              Drop your bank statement here, or click to browse
            </div>
            <div className="hint">Supports PDF and CSV files</div>
          </>
        )}
      </div>

      {/* Upload button */}
      <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            flex: 1,
            opacity: !file || uploading ? 0.5 : 1,
            cursor: !file || uploading ? "not-allowed" : "pointer",
          }}
          id="upload-btn"
        >
          {uploading ? "Uploading..." : "Upload & Parse"}
        </button>
        {file && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setFile(null);
              setResult(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            id="clear-btn"
          >
            Clear
          </button>
        )}
      </div>

      {/* Instructions */}
      <div
        className="card"
        style={{ marginTop: "32px", animationDelay: "0.2s" }}
      >
        <div className="card-title">How it works</div>
        <ol
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            lineHeight: 1.8,
            paddingLeft: "20px",
          }}
        >
          <li>Export your monthly statement from the GTBank or OPay app (PDF)</li>
          <li>Select the bank above and drop the file</li>
          <li>
            We&apos;ll parse it, classify transactions, and add them to your
            dashboard
          </li>
          <li>Review uncategorized transactions on the dashboard and fix any labels</li>
        </ol>
      </div>
    </main>
  );
}
