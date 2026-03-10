import { useEffect } from "react";

export default function TabMonitor() {

  useEffect(() => {

    const handleVisibility = () => {

      if (document.hidden) {
        alert("Tab switching detected!");
      }

    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);

  }, []);

}