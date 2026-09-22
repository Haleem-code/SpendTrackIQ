"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, LogOut, Bell, Menu, X, Settings, FileText, ChevronsLeft, ChevronsRight, Upload } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState("weekly");

  useEffect(() => {
    const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
    if (token) {
      fetch(`${API_URL}/user/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setNotificationFrequency(data.settings.notificationFrequency);
        }
      })
      .catch(() => {});
    }
  }, []);

  const saveSettings = async () => {
    const token = document.cookie.match(/(^| )token=([^;]+)/)?.[2];
    if (!token) return;
    try {
      await fetch(`${API_URL}/user/settings`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ notificationFrequency })
      });
      setShowSettings(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-title" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.png" 
              alt="SpendTrackIQ" 
              style={{ 
                height: 24, 
                width: isCollapsed ? 24 : "auto", 
                objectFit: "cover", 
                objectPosition: "left" 
              }} 
            />
          </div>
          <button
            className="mobile-menu-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item">
            <span className="icon" style={{ display: "flex", alignItems: "center" }}>
              <LayoutDashboard size={18} />
            </span>
            {!isCollapsed && "Dashboard"}
          </a>
          <a href="/statements" className="nav-item">
            <span className="icon" style={{ display: "flex", alignItems: "center" }}>
              <FileText size={18} />
            </span>
            {!isCollapsed && "Statements"}
          </a>
          <a href="/upload" className="nav-item" style={{ marginTop: "16px" }}>
            <div className="btn btn-primary btn-block" style={{ gap: 6 }}>
              <Upload size={16} />
              {!isCollapsed && "Upload"}
            </div>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => setShowSettings(true)} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <span className="icon" style={{ display: "flex", alignItems: "center" }}>
              <Settings size={18} />
            </span>
            {!isCollapsed && "Settings"}
          </button>
          <button className="nav-item" onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <span className="icon" style={{ display: "flex", alignItems: "center" }}>
              <LogOut size={18} />
            </span>
            {!isCollapsed && "Log Out"}
          </button>
          <button
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={20} />
            </button>
            <span className="icon"></span>
            Overview
          </div>
          <div className="topbar-actions">
            <span
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              <Bell size={20} />
            </span>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>

      {showSettings && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)"
        }}>
          <div className="panel fade-in" style={{ width: "100%", maxWidth: "400px", margin: "20px" }}>
            <div className="panel-header">
              <div className="panel-title">Settings</div>
              <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Reminder Notifications
                </label>
                <select 
                  value={notificationFrequency} 
                  onChange={(e) => setNotificationFrequency(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="none">None</option>
                </select>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px" }}>
                  We&apos;ll send you an email and an in-app reminder to upload your statements if you haven&apos;t recently.
                </p>
              </div>
              <button className="btn btn-primary btn-block" onClick={saveSettings}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
