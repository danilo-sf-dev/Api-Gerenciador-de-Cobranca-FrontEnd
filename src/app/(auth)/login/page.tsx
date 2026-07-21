"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function LoginPage() {
  const { login, changeRole } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email);
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    // Simulate login with Google. We try to find danilo@empresa.com (active Owner)
    try {
      await login("danilo@empresa.com");
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar login com Google.");
    } finally {
      setLoading(false);
    }
  };

  // Switch wrapper to quickly test various login responses in the mock system
  const handleTestLoginResponse = async (type: "pending" | "incorrect" | "notfound") => {
    setLoading(true);
    setError("");
    try {
      if (type === "pending") {
        // u-4 is pending
        await login("maria@convite.com");
      } else if (type === "incorrect") {
        // existing active email, but simulate password error
        throw new Error("Credenciais inválidas. E-mail ou senha incorretos.");
      } else {
        // non-existing
        await login("inexistente@empresa.com");
      }
    } catch (err: any) {
      setError(err.message);
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
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "var(--colors-primary)",
              margin: "0 auto 12px auto",
            }}
          />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Entrar no Gestão Finance</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--colors-muted)", marginTop: 4 }}>
            Acesso restrito para administradores e colaboradores
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

          <div className={styles.inputGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.label}>Senha</label>
              <Link
                href={ROUTES.ESQUECI_SENHA}
                style={{ fontSize: "0.75rem", color: "var(--colors-muted)", fontWeight: 500 }}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ width: "100%", height: 40 }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "8px 0",
            gap: 8,
          }}
        >
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--colors-border)" }} />
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--colors-muted)",
              textTransform: "uppercase",
            }}
          >
            ou
          </span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--colors-border)" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`${styles.btn} ${styles.btnSecondary}`}
          style={{ width: "100%", height: 40 }}
        >
          Entrar com Google
        </button>

        <div
          style={{
            marginTop: 8,
            padding: "12px",
            backgroundColor: "var(--colors-surface)",
            borderRadius: "var(--radius-sm)",
            border: "1px dashed var(--colors-border)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "var(--colors-muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Simulador de Testes
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button
              onClick={() => handleTestLoginResponse("pending")}
              className={styles.btn}
              style={{
                fontSize: "0.6875rem",
                padding: "4px 8px",
                backgroundColor: "var(--colors-bg)",
              }}
            >
              Erro: Convite Pendente
            </button>
            <button
              onClick={() => handleTestLoginResponse("incorrect")}
              className={styles.btn}
              style={{
                fontSize: "0.6875rem",
                padding: "4px 8px",
                backgroundColor: "var(--colors-bg)",
              }}
            >
              Erro: Senha Incorreta
            </button>
            <button
              onClick={() => handleTestLoginResponse("notfound")}
              className={styles.btn}
              style={{
                fontSize: "0.6875rem",
                padding: "4px 8px",
                backgroundColor: "var(--colors-bg)",
              }}
            >
              Erro: Conta Inexistente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
