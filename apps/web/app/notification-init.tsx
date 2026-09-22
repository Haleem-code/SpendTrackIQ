"use client";

import { useEffect } from "react";

export default function NotificationInit() {
  useEffect(() => {
    // Only request notification permission once the app is installed as PWA or after first login
    if ("Notification" in window && Notification.permission === "default") {
      // Delay the request so it doesn't fire on first page load (annoying)
      const timer = setTimeout(() => {
        Notification.requestPermission();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
