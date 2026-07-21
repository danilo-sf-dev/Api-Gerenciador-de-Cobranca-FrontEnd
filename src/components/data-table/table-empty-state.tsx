"use client";

import React from "react";
import { Inbox } from "lucide-react";
import styles from "./data-table.module.css";

type TableEmptyStateProps = {
  message?: string;
};

export function TableEmptyState({ message = "Nenhum resultado encontrado" }: TableEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <Inbox size={32} style={{ strokeWidth: 1.5 }} />
      <span className={styles.emptyTitle}>{message}</span>
      <span style={{ fontSize: "0.8125rem" }}>Tente alterar seus termos de busca ou filtros.</span>
    </div>
  );
}
