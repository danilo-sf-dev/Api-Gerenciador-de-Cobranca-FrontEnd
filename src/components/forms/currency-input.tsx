"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, parseCurrency } from "@/lib/formatters/currency";
import styles from "../ui/ui.module.css";

type CurrencyInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
};

export function CurrencyInput({ value, onChange, error, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Keep internal text state synchronized with numeric props
    setDisplayValue(value > 0 ? formatCurrency(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;
    const numeric = parseCurrency(rawText);
    onChange(numeric);
    setDisplayValue(numeric > 0 ? formatCurrency(numeric) : "");
  };

  return (
    <input
      type="text"
      className={`${styles.input} ${error ? styles.inputError : ""}`}
      value={displayValue}
      onChange={handleChange}
      placeholder="R$ 0,00"
      {...props}
    />
  );
}
