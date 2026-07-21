"use client";

import React, { useState } from "react";
import { AuthService } from "@/features/auth/services/auth.service";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import styles from "@/components/ui/ui.module.css";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
      setSuccess(true);
    } catch {
      // Ignore errors for security reasons
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--colors-surface)",
        padding: "var(--space-md)",
      }}
    >
      <div className={styles.card} style={{ width: "100%", maxWidth: 400, gap: "20px" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Recuperação de Senha</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--colors-muted)", marginTop: 4 }}>
            Insira seu e-mail para receber as instruções de recuperação
          </p>
        </div>

        {success ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: "12px",
                backgroundColor: "var(--status-paid-bg)",
                border: "1px solid var(--status-paid-text)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
                color: "var(--status-paid-text)",
                lineHeight: 1.4,
              }}
            >
              Se o e-mail informado estiver cadastrado e ativo no sistema, você receberá um link
              para redefinir sua senha em instantes.
            </div>
            <Link
              href={ROUTES.LOGIN}
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ width: "100%" }}
            >
              Voltar ao Login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className={styles.inputGroup}>
              <label className={styles.label}>E-mail corporativo</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@empresa.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ width: "100%", height: 40 }}
            >
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>

            <Link
              href={ROUTES.LOGIN}
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ width: "100%" }}
            >
              Cancelar
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
