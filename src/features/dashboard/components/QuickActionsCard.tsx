"use client";

import React from "react";
import Link from "next/link";
import { Plus, UploadCloud } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import uiStyles from "@/components/ui/ui.module.css";

export function QuickActionsCard() {
  return (
    <div className={uiStyles.card}>
      <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Ações Rápidas</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <Link
          href={`${ROUTES.TITLES}?novo=true`}
          className={uiStyles.btn}
          style={{
            justifyContent: "flex-start",
            backgroundColor: "var(--colors-surface)",
            color: "var(--colors-ink)",
            border: "1px solid var(--colors-border)",
          }}
        >
          <Plus size={16} style={{ color: "var(--colors-primary)" }} />
          <span>Novo Título</span>
        </Link>
        <Link
          href={`${ROUTES.TITLES}/importar`}
          className={uiStyles.btn}
          style={{
            justifyContent: "flex-start",
            backgroundColor: "var(--colors-surface)",
            color: "var(--colors-ink)",
            border: "1px solid var(--colors-border)",
          }}
        >
          <UploadCloud size={16} style={{ color: "var(--colors-primary)" }} />
          <span>Importar Títulos</span>
        </Link>
      </div>
    </div>
  );
}
