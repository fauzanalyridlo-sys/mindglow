"use client";

import { useEffect, useRef } from "react";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

export default function IdleSessionGuard() {
  const logoutStartedRef = useRef(false);

  useEffect(() => {
    let lastActivity = Date.now();
    let idleTimer: number | null = null;

    const logout = async () => {
      if (logoutStartedRef.current) return;

      logoutStartedRef.current = true;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });
      } catch {
        // Redirect tetap dilakukan meskipun request logout gagal.
      }

      window.location.replace("/login");
    };

    const scheduleIdleCheck = () => {
      if (idleTimer !== null) {
        window.clearTimeout(idleTimer);
      }

      const remaining =
        IDLE_TIMEOUT_MS - (Date.now() - lastActivity);

      if (remaining <= 0) {
        void logout();
        return;
      }

      idleTimer = window.setTimeout(() => {
        void logout();
      }, remaining);
    };

    const handleActivity = () => {
      if (logoutStartedRef.current) return;

      lastActivity = Date.now();
      scheduleIdleCheck();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleIdleCheck();
      }
    };

    const heartbeat = async () => {
      if (logoutStartedRef.current) return;

      const inactiveDuration = Date.now() - lastActivity;

      if (inactiveDuration >= IDLE_TIMEOUT_MS) {
        await logout();
        return;
      }

      // Tidak memperpanjang session saat pengguna sedang tidak aktif.
      if (inactiveDuration > HEARTBEAT_INTERVAL_MS) {
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401) {
          logoutStartedRef.current = true;
          window.location.replace("/login");
        }
      } catch {
        // Kegagalan jaringan tidak memperpanjang session.
      }
    };

    const activityEvents = [
      "pointerdown",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ] as const;

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, {
        passive: true,
      });
    });

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    scheduleIdleCheck();

    const heartbeatTimer = window.setInterval(() => {
      void heartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (idleTimer !== null) {
        window.clearTimeout(idleTimer);
      }

      window.clearInterval(heartbeatTimer);

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return null;
}
