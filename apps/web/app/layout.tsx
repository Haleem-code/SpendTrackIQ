import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haleem's Income Tracker",
  description:
    "Track your yearly income by uploading GTBank & OPay bank statements. View monthly breakdowns, recategorize transactions, and get weekly upload reminders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div className="container">
          <nav className="nav">
            <div className="nav-brand">
              <span>💰</span>
              <span>Haleem&apos;s Income Tracker</span>
            </div>
            <div className="nav-links">
              <a href="/" className="nav-link active" id="nav-dashboard">
                Dashboard
              </a>
              <a href="/upload" className="nav-link" id="nav-upload">
                Upload
              </a>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
