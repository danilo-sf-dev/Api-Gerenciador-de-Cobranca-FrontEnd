"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import styles from "../ui/ui.module.css";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === "success";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        backgroundColor: "var(--colors-bg)",
        border: `1px solid ${isSuccess ? "var(--status-paid-text)" : "var(--status-late-text)"}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-alert)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 2000,
        maxWidth: 350,
        animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style jsx global>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {isSuccess ? (
        <CheckCircle2 size={18} style={{ color: "var(--status-paid-text)", flexShrink: 0 }} />
      ) : (
        <AlertCircle size={18} style={{ color: "var(--status-late-text)", flexShrink: 0 }} />
      )}

      <div style={{ fontSize: "0.875rem", fontWeight: 500, flex: 1 }}>{message}</div>

      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--colors-muted)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
