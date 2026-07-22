"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { User } from "@/types";

interface DashboardHeaderProps {
  user: User | null;
  lastSyncTime: string;
  handleRetry: () => void;
}

export function DashboardHeader({ user, lastSyncTime, handleRetry }: DashboardHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-sm)",
      }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Resumo Operacional</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Bem-vindo, {user?.name}. Monitoramento em tempo real do ciclo de cobranças.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
        {lastSyncTime && (
          <span style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
            Sincronizado às {lastSyncTime}
          </span>
        )}
        <button
          onClick={handleRetry}
          title="Atualizar dados"
          style={{
            background: "none",
            border: "1px solid var(--colors-border)",
            borderRadius: "var(--radius-sm)",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--colors-ink)",
            height: 32,
            width: 32,
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--colors-surface)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="Atualizar dados"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
