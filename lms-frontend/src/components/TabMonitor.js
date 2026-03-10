import { useEffect } from "react";

export default function TabMonitor({ onViolation }) {

  useEffect(() => {

    const handleVisibility = () => {

      if (document.hidden) {

        alert("⚠ Tab switching detected");

        onViolation("tab-switch");

      }

    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };

  }, []);

  return null;
}