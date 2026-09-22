import type { Metadata, Viewport } from "next";
import "./globals.css";
import NotificationInit from "./notification-init";

export const metadata: Metadata = {
  title: "SpendTrackIQ",
  description: "Track your yearly income by uploading GTBank & OPay bank statements.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0B0C10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/pwa-icon.jpg" />
      </head>
      <body>
        <NotificationInit />
        {children}
      </body>
    </html>
  );
}
