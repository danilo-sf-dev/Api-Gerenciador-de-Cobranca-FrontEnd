"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthService } from "@/features/auth/services/auth.service";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";
import Link from "next/link";

export default function AtivarContaPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Validate token simulation
    if (token === "valido") {
      setIsValidToken(true);
      setName("Maria Convidada"); // Pre-fill name from invite registry
    } else {
      setIsValidToken(false);
      setError(
        token === "expirado"
          ? "Este convite de ativação expirou. Solicite um novo link de acesso ao administrador."
          : "Token de ativação inválido ou corrompido.",
      );
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await AuthService.activateAccount(token, name, password);
      setSuccess("Sua conta foi ativada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao ativar a conta.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewInvite = () => {
    alert("Um novo convite foi solicitado. Verifique seu e-mail corporativo em instantes.");
    router.push(ROUTES.LOGIN);
  };

  if (isValidToken === null) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Carregando informações do convite...
      </div>
    );
  }

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
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Ativação de Conta</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--colors-muted)", marginTop: 4 }}>
            Defina seus dados para ativar o acesso ao sistema
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
              lineHeight: 1.4,
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

        {isValidToken ? (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nome Completo</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Nova Senha</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirmar Senha</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha definida"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ width: "100%", height: 40, marginTop: 8 }}
            >
              {loading ? "Ativando..." : "Ativar Minha Conta"}
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={handleRequestNewInvite}
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ width: "100%", height: 40 }}
            >
              Solicitar Novo Convite
            </button>
            <Link
              href={ROUTES.LOGIN}
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ width: "100%", height: 40 }}
            >
              Voltar ao Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
