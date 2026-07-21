"use client";

import React from "react";
import { formatCPF } from "@/lib/formatters/cpf";
import styles from "../ui/ui.module.css";

type CPFInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

export function CpfInput({ value, onChange, error, ...props }: CPFInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
    onChange(rawDigits);
  };

  return (
    <input
      type="text"
      className={`${styles.input} ${error ? styles.inputError : ""}`}
      value={formatCPF(value)}
      onChange={handleChange}
      placeholder="000.000.000-00"
      {...props}
    />
  );
}
