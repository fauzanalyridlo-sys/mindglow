"use client";

import { useEffect } from "react";

const ACTIVITY_THROTTLE_MS = 60 * 1000;

export default function SessionActivityMonitor() {
  useEffect(() => {
    let lastSent = 0;
    let redirecting = false;

    async function reportActivity() {
      if (redirecting) return;

      const now = Date.now();

      if (now - lastSent < ACTIVITY_THROTTLE_MS) {
        return;
      }

      lastSent = now;

      try {
        const response = await fetch("/api/auth/activity", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401) {
          redirecting = true;
          window.location.replace("/login?reason=timeout");
        }
      } catch {
        // Gangguan jaringan sementara tidak langsung mengakhiri sesi.
      }
    }

    const events = [
      "pointerdown",
      "keydown",
      "touchstart",
      "scroll",
    ] as const;

    for (const event of events) {
      window.addEventListener(event, reportActivity, { passive: true });
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, reportActivity);
      }
    };
  }, []);

  return null;
}
