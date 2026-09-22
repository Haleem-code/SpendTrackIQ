import Image from "next/image";
import { FileUp, Brain, BarChart3, Bell, Lock, Pencil } from "lucide-react";

export default function LandingPage() {
  const F = "Inter, system-ui, sans-serif";

  return (
    <div
      style={{
        background: "#0C0C0E",
        minHeight: "100vh",
        color: "#F4F4F5",
        fontFamily: F,
        overflowX: "hidden",
      }}
    >
      {/* ── NAV ──────────────────────────────── */}
      <nav
        className="landing-nav"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: "60px",
          background: "rgba(12,12,14,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #22222C",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/logo.png"
            alt="SpendTrackIQ"
            style={{ height: 28, width: "auto" }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="/login"
            style={{
              padding: "7px 18px",
              borderRadius: 6,
              border: "1px solid #22222C",
              color: "#A1A1AA",
              textDecoration: "none",
              fontSize: "0.8125rem",
              fontWeight: 500,
            }}
          >
            Log In
          </a>
          <a
            href="/register"
            style={{
              padding: "7px 18px",
              borderRadius: 6,
              background: "#22C55E",
              color: "#0a160d",
              textDecoration: "none",
              fontSize: "0.8125rem",
              fontWeight: 700,
            }}
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────── */}
      <section
        className="hero-section"
        style={{
          paddingTop: 140,
          paddingBottom: 80,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "140px 24px 80px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "60px",
          flexWrap: "wrap",
        }}
      >
        {/* Gridlines background */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "-50vw",
            right: "-50vw",
            bottom: 0,
            backgroundSize: "40px 40px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        {/* TEXT CONTENT (LEFT) */}
        <div className="hero-col-left" style={{ flex: "1 1 400px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#22C55E",
              marginBottom: 28,
              letterSpacing: "0.04em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22C55E",
                display: "inline-block",
              }}
            />
            SMART INCOME TRACKER
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              color: "#FAFAFA",
              marginBottom: 20,
            }}
          >
            Your income,
            <br />
            tracked intelligently.
          </h1>

          <p
            style={{
              fontSize: "1.0625rem",
              color: "#71717A",
              lineHeight: 1.8,
              maxWidth: 520,
              marginBottom: 36,
            }}
          >
            Upload your bank statements and instantly see your yearly income
            broken down by month, bank, and category. No spreadsheets needed.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/register"
              style={{
                padding: "12px 32px",
                borderRadius: 8,
                fontWeight: 700,
                background: "#22C55E",
                color: "#0a160d",
                textDecoration: "none",
                fontSize: "0.9375rem",
              }}
            >
              Start Tracking Free →
            </a>
            <a
              href="#features"
              style={{
                padding: "12px 32px",
                borderRadius: 8,
                fontWeight: 600,
                border: "1px solid #22222C",
                color: "#A1A1AA",
                textDecoration: "none",
                fontSize: "0.9375rem",
                background: "#111115",
              }}
            >
              See How It Works
            </a>
          </div>

          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 52,
              flexWrap: "wrap",
            }}
          >
            {[
              ["Free", "No subscription ever"],
              ["Multiple Banks", "All major banks supported"],
              ["< 60s", "From upload to insight"],
            ].map(([val, label]) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#F4F4F5",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#52525B",
                    marginTop: 4,
                    letterSpacing: "0.03em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ANIMATED ILLUSTRATION (RIGHT) */}
        <div className="hero-col-right" style={{ flex: "1.2 1 500px" }}>
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid #22222C",
              background: "#111115",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.4)",
              position: "relative",
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            {/* Main animated container */}
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* 1. Upload Box (Left Side) */}
              <div
                className="upload-box"
                style={{
                  flex: 1,
                  height: "260px",
                  background: "#0C0C0E",
                  border: "2px dashed #2E2E3D",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  className="file-icon"
                  style={{
                    width: 60,
                    height: 72,
                    background:
                      "linear-gradient(135deg, #22C55E 0%, #16a34a 100%)",
                    borderRadius: "8px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                  }}
                >
                  PDF
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 20,
                      height: 20,
                      background: "#111115",
                      borderBottomLeftRadius: 8,
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 20,
                    fontSize: "0.8rem",
                    color: "#A1A1AA",
                    fontWeight: 500,
                  }}
                >
                  GTBank_Statement.pdf
                </div>

                {/* Progress bar overlay */}
                <div
                  className="progress-bar-container"
                  style={{
                    position: "absolute",
                    bottom: 40,
                    width: "70%",
                    height: 6,
                    background: "#22222C",
                    borderRadius: 3,
                    overflow: "hidden",
                    opacity: 0,
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      height: "100%",
                      background: "#22C55E",
                      width: "0%",
                    }}
                  />
                </div>
              </div>

              {/* 2. Arrow / Processing Indicator (Middle) */}
              <div
                className="process-arrow"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(34,197,94,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>

              {/* 3. Parsed Transactions (Right Side) */}
              <div
                className="tx-list"
                style={{
                  flex: 1.2,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  position: "relative",
                }}
              >
                {[
                  { type: "credit", text: "+ ₦1,250,000", label: "Salary" },
                  { type: "debit", text: "- ₦45,000", label: "Groceries" },
                  { type: "credit", text: "+ ₦200,000", label: "Transfer" },
                  { type: "debit", text: "- ₦12,500", label: "Subscription" },
                ].map((tx, i) => (
                  <div
                    key={i}
                    className="tx-item"
                    style={{
                      height: 48,
                      background: "#0C0C0E",
                      border: "1px solid #22222C",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      gap: "10px",
                      opacity: 0,
                      transform: "translateX(20px)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background:
                          tx.type === "credit"
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(248,113,113,0.15)",
                        color: tx.type === "credit" ? "#22C55E" : "#F87171",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 6,
                          width: "60%",
                          background: "#22222C",
                          borderRadius: 3,
                          marginBottom: 4,
                        }}
                      />
                      <div style={{ fontSize: "0.6rem", color: "#71717A" }}>
                        {tx.label}
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: tx.type === "credit" ? "#22C55E" : "#F4F4F5",
                      }}
                    >
                      {tx.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes uploadFloat {
              0% { transform: translateY(0); }
              10% { transform: translateY(-10px) scale(1.02); border-color: rgba(34,197,94,0.5); }
              30% { transform: translateY(-10px) scale(1.02); }
              40% { transform: translateY(0); border-color: #2E2E3D; }
              100% { transform: translateY(0); }
            }
            @keyframes showProgressContainer {
              0%, 5% { opacity: 0; }
              10%, 35% { opacity: 1; }
              40%, 100% { opacity: 0; }
            }
            @keyframes fillProgress {
              0%, 10% { width: 0%; }
              30% { width: 100%; }
              100% { width: 100%; }
            }
            @keyframes popArrow {
              0%, 25% { opacity: 0; transform: scale(0.5); }
              35% { opacity: 1; transform: scale(1.1); }
              40% { opacity: 1; transform: scale(1); }
              80% { opacity: 1; transform: scale(1); }
              90%, 100% { opacity: 0; transform: scale(0.5); }
            }
            @keyframes slideInTx {
              0%, 40% { opacity: 0; transform: translateX(20px); }
              45% { opacity: 1; transform: translateX(0); }
              85% { opacity: 1; transform: translateX(0); }
              95%, 100% { opacity: 0; transform: translateX(-10px); }
            }

            .upload-box {
              animation: uploadFloat 6s infinite;
            }
            .progress-bar-container {
              animation: showProgressContainer 6s infinite;
            }
            .progress-bar {
              animation: fillProgress 6s infinite;
            }
            .process-arrow {
              animation: popArrow 6s infinite;
            }
            
            .tx-item:nth-child(1) { animation: slideInTx 6s infinite 0.1s; }
            .tx-item:nth-child(2) { animation: slideInTx 6s infinite 0.3s; }
            .tx-item:nth-child(3) { animation: slideInTx 6s infinite 0.5s; }
            .tx-item:nth-child(4) { animation: slideInTx 6s infinite 0.7s; }

            @media (max-width: 768px) {
              .landing-nav { padding: 0 20px !important; }
              .hero-section { padding: 100px 20px 60px !important; gap: 40px !important; }
              .hero-col-left { flex: 1 1 100% !important; }
              .hero-col-right { display: none !important; }
            }
          `,
            }}
          />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section
        id="features"
        style={{ maxWidth: 1080, margin: "0 auto 88px", padding: "0 24px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: 10,
              color: "#FAFAFA",
            }}
          >
            Everything you need
          </h2>
          <p style={{ color: "#71717A", fontSize: "0.9375rem" }}>
            No manual entry. No integrations. Just upload and see.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              icon: <FileUp size={24} color="#22C55E" />,
              title: "PDF & CSV Upload",
              desc: "Drop your bank statement directly in. Both PDF and CSV are parsed instantly with no manual input.",
            },
            {
              icon: <Brain size={24} color="#22C55E" />,
              title: "Smart Auto-Classification",
              desc: "Transactions are auto-tagged as income, expense, or transfer. Correct any misclassification with one click.",
            },
            {
              icon: <BarChart3 size={24} color="#22C55E" />,
              title: "Yearly Dashboard",
              desc: "See your full annual income with month-by-month charts, per-bank breakdowns, and real transaction history.",
            },
            {
              icon: <Bell size={24} color="#22C55E" />,
              title: "Automatic Reminders",
              desc: "If you forget to upload, SpendTrackIQ emails you every week until you're back in sync with your data.",
            },
            {
              icon: <Lock size={24} color="#22C55E" />,
              title: "Bank-Grade Privacy",
              desc: "Every user is fully isolated. Your statements and income figures are securely stored and never visible to anyone else.",
            },
            {
              icon: <Pencil size={24} color="#22C55E" />,
              title: "Manual Corrections",
              desc: "Recategorize any transaction directly from the dashboard. Changes apply immediately across your reports.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                padding: "24px",
                borderRadius: 12,
                background: "#111115",
                border: "1px solid #22222C",
              }}
            >
              <div
                style={{
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                {icon}
              </div>
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  marginBottom: 8,
                  color: "#E4E4E7",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  color: "#71717A",
                  fontSize: "0.8375rem",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto 88px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 10,
            color: "#FAFAFA",
          }}
        >
          Up and running in 3 steps
        </h2>
        <p
          style={{ color: "#71717A", fontSize: "0.9375rem", marginBottom: 52 }}
        >
          No bank credentials. No API keys. Just a file.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
          }}
        >
          {[
            {
              step: "1",
              title: "Create an account",
              desc: "Register with your email. Free forever, no credit card.",
            },
            {
              step: "2",
              title: "Upload your statement",
              desc: "Export from your bank app and drop it into SpendTrackIQ.",
            },
            {
              step: "3",
              title: "See your income",
              desc: "Instantly view charts, categories, and your full transaction history.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#22C55E",
                }}
              >
                {step}
              </div>
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  marginBottom: 8,
                  color: "#E4E4E7",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  color: "#71717A",
                  fontSize: "0.8375rem",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section
        style={{
          maxWidth: 620,
          margin: "0 auto 88px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "52px 40px",
            borderRadius: 16,
            background: "#111115",
            border: "1px solid #22222C",
          }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: 10,
              color: "#FAFAFA",
            }}
          >
            Stop guessing. Start knowing.
          </h2>
          <p
            style={{
              color: "#71717A",
              marginBottom: 32,
              lineHeight: 1.7,
              fontSize: "0.9375rem",
            }}
          >
            Take control of your income data. Free, private, and built
            specifically for you.
          </p>
          <a
            href="/register"
            style={{
              padding: "12px 40px",
              borderRadius: 8,
              fontWeight: 700,
              background: "#22C55E",
              color: "#0a160d",
              textDecoration: "none",
              fontSize: "0.9375rem",
              display: "inline-block",
            }}
          >
            Create Free Account →
          </a>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #22222C",
          padding: "28px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#52525B",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ fontWeight: 600, color: "#71717A" }}>
          © {new Date().getFullYear()} SpendTrackIQ
        </div>
      </footer>
    </div>
  );
}
