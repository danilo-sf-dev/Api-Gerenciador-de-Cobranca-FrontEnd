"use client";

import React from "react";
import styles from "../ui/ui.module.css";

type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
