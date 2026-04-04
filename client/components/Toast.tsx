"use client";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastEvent = {
  message: string;
  type: ToastType;
};

// Global event emitter — call window.showToast() from anywhere
declare global {
  interface Window {
    showToast: (message: string, type?: ToastType) => void;
  }
}

export default function Toast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.showToast = (msg: string, t: ToastType = "success") => {
      if (timer) clearTimeout(timer);
      setMessage(msg);
      setType(t);
      setVisible(true);
      const newTimer = setTimeout(() => setVisible(false), 3000);
      setTimer(newTimer);
    };
  }, [timer]);

  const colors = {
    success: { bg: "#0f2a0f", border: "#1a4a1a", text: "#4ade80" },
    error:   { bg: "#1f0a0a", border: "#3d1515", text: "#f87171" },
    info:    { bg: "#0f1a2a", border: "#1a2a4a", text: "#60a5fa" },
  };

  const c = colors[type];

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 80}px)`,
      opacity: visible ? 1 : 0,
      transition: "all 0.25s ease",
      zIndex: 9999,
      pointerEvents: visible ? "auto" : "none",
    }}>
      <div style={{
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 10, padding: "10px 18px",
        fontSize: 13, color: c.text, fontWeight: 500,
        whiteSpace: "nowrap", fontFamily: "inherit",
      }}>
        {message}
      </div>
    </div>
  );
}