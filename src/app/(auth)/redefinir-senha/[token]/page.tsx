"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (token === "expirado") {
        throw new Error("Este link de redefinição expirou. Solicite um novo link.");
      }
      setSuccess("Senha redefinida com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha.");
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
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Redefinir Senha</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--colors-muted)", marginTop: 4 }}>
            Digite e confirme sua nova senha de acesso
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--status-late-bg)",
              border: "1px solid var(--status-late-text)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              color: "var(--status-late-text)",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--status-paid-bg)",
              border: "1px solid var(--status-paid-text)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              color: "var(--status-paid-text)",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nova Senha</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirmar Nova Senha</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a mesma senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ width: "100%", height: 40 }}
          >
            {loading ? "Redefinindo..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
