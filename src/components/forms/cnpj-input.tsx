"use client";

import React from "react";
import { formatCNPJ } from "@/lib/formatters/cnpj";
import styles from "../ui/ui.module.css";

type CNPJInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

export function CnpjInput({ value, onChange, error, ...props }: CNPJInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 14);
    onChange(rawDigits);
  };

  return (
    <input
      type="text"
      className={`${styles.input} ${error ? styles.inputError : ""}`}
      value={formatCNPJ(value)}
      onChange={handleChange}
      placeholder="00.000.000/0000-00"
      {...props}
    />
  );
}
