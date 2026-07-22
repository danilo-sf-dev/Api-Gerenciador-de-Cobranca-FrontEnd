"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function NoPermissionPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "var(--space-lg)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "var(--status-late-bg)",
          border: "1px solid var(--status-late-text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-md)",
          color: "var(--status-late-text)",
        }}
      >
        <ShieldAlert size={32} />
      </div>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Acesso Negado (403)</h1>

      <p
        style={{
          color: "var(--colors-muted)",
          maxWidth: 480,
          fontSize: "0.9375rem",
          lineHeight: 1.5,
          marginBottom: "var(--space-lg)",
        }}
      >
        Sua conta atual não possui privilégios de acesso ou nível hierárquico suficiente para
        visualizar esta página ou executar esta operação.
      </p>

      <div
        style={{
          display: "flex",
          gap: "var(--space-md)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link href={ROUTES.DASHBOARD} className={`${styles.btn} ${styles.btnPrimary}`}>
          <Home size={16} />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
