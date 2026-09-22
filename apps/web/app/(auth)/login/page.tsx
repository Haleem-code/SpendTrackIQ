"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const F = "Inter, system-ui, sans-serif";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      document.cookie = `token=${data.token}; path=/; max-age=86400`;
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    borderRadius: 8, fontSize: "0.875rem",
    background: "#111115", border: "1px solid #2E2E3D",
    color: "#F4F4F5", outline: "none",
    boxSizing: "border-box", fontFamily: F,
    transition: "border-color 150ms",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0C0C0E", fontFamily: F }}>
      {/* Left Side: Form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", zIndex: 10
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
            <img src="/logo.png" alt="SpendTrackIQ" style={{ height: 32, width: "auto" }} />
          </a>

          {/* Card */}
          <div style={{
            background: "#111115",
            border: "1px solid #22222C",
            borderRadius: 14,
            padding: "32px 28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
          }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FAFAFA", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Welcome back
            </h1>
            <p style={{ color: "#71717A", fontSize: "0.8375rem", margin: "0 0 24px" }}>
              Sign in to your account
            </p>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 18,
                background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)",
                color: "#F87171", fontSize: "0.8125rem",
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: "0.75rem", fontWeight: 600, color: "#71717A", letterSpacing: "0.04em" }}>
                  EMAIL
                </label>
                <input
                  id="login-email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: "0.75rem", fontWeight: 600, color: "#71717A", letterSpacing: "0.04em" }}>
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" style={{ ...inputStyle, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "transparent", border: "none", color: "#71717A", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit" type="submit" disabled={loading}
                style={{
                  marginTop: 6, padding: "11px",
                  borderRadius: 8, border: "none",
                  background: loading ? "#16A34A" : "#22C55E",
                  color: "#0a160d", fontWeight: 700, fontSize: "0.875rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: F, opacity: loading ? 0.7 : 1,
                  transition: "opacity 150ms",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.8125rem", color: "#52525B" }}>
            No account?{" "}
            <a href="/register" style={{ color: "#22C55E", textDecoration: "none", fontWeight: 600 }}>
              Create one free
            </a>
          </p>
        </div>
      </div>

      {/* Right Side: Illustration */}
      <div className="desktop-only" style={{
        flex: 1,
        background: "linear-gradient(135deg, #0C0C0E 0%, #111115 100%)",
        borderLeft: "1px solid #22222C",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundSize: "40px 40px",
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
        }} />

        {/* Animated Cards */}
        <div style={{ position: "relative", width: 400, height: 400 }}>
          <div style={{
            position: "absolute", top: "10%", left: "10%", right: "10%",
            background: "#16161B", border: "1px solid #2E2E3D",
            borderRadius: 16, padding: 24, boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
            animation: "floatSlow 8s ease-in-out infinite"
          }}>
            <div style={{ fontSize: "0.8125rem", color: "#A1A1AA", marginBottom: 8, fontWeight: 600, letterSpacing: "0.04em" }}>TOTAL INCOME THIS YEAR</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#22C55E", letterSpacing: "-0.02em" }}>₦ 12,450,000</div>
            
            <div style={{ marginTop: 24, display: "flex", alignItems: "flex-end", gap: 12, height: 60 }}>
              {[40, 70, 45, 90, 60, 100].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: "#22C55E", borderRadius: "4px 4px 0 0", opacity: h === 100 ? 1 : 0.4 }} />
              ))}
            </div>
          </div>

          <div style={{
            position: "absolute", bottom: "10%", right: "-10%",
            background: "#111115", border: "1px solid #2E2E3D",
            borderRadius: 12, padding: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", gap: 16,
            animation: "floatFast 6s ease-in-out infinite 1s"
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 20, height: 20, border: "2px solid #22C55E", borderRadius: "50%", borderTopColor: "transparent", transform: "rotate(45deg)" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#F4F4F5", fontWeight: 600 }}>Salary Deposit</div>
              <div style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>GTBank • Just now</div>
            </div>
            <div style={{ fontWeight: 700, color: "#22C55E", marginLeft: 16 }}>+₦ 850k</div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes floatSlow {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes floatFast {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
            100% { transform: translateY(0px) scale(1); }
          }
        `}} />
      </div>
    </div>
  );
}
