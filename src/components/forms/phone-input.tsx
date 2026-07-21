"use client";

import React from "react";
import { formatPhone } from "@/lib/formatters/phone";
import styles from "../ui/ui.module.css";

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

export function PhoneInput({ value, onChange, error, ...props }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
    onChange(rawDigits);
  };

  return (
    <input
      type="text"
      className={`${styles.input} ${error ? styles.inputError : ""}`}
      value={formatPhone(value)}
      onChange={handleChange}
      placeholder="(00) 00000-0000"
      {...props}
    />
  );
}
