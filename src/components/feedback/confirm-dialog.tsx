"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import styles from "../ui/ui.module.css";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: 400 }}>
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle
              size={18}
              style={{ color: isDanger ? "var(--status-late-text)" : "var(--status-overdue-text)" }}
            />
            <span className={styles.modalTitle}>{title}</span>
          </div>
          <button onClick={onCancel} className={styles.modalCloseBtn}>
            <X size={16} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ fontSize: "0.875rem", color: "var(--colors-muted)" }}>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.btn} ${isDanger ? styles.btnDanger : styles.btnPrimary}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
