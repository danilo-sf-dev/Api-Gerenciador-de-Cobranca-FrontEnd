"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";
import styles from "./login.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    // Default theme is "light" unless explicitly saved as "dark"
    const initialTheme = saved === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

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

    try {
      await login("danilo@empresa.com");
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar login com Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestLoginResponse = async (type: "pending" | "incorrect" | "notfound") => {
    setLoading(true);
    setError("");
    try {
      if (type === "pending") {
        await login("maria@convite.com");
      } else if (type === "incorrect") {
        throw new Error("Credenciais inválidas. E-mail ou senha incorretos.");
      } else {
        await login("inexistente@empresa.com");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Header Bar */}
      <header className={styles.topNav}>
        <div className={styles.brandLink}>
          <div className={styles.brandLogoBadge}>
            <Building2 size={20} />
          </div>
          <span className={styles.brandName}>Gestão Finance</span>
        </div>

        <div className={styles.topRightActions}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
            title={theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
          >
            {theme === "light" ? (
              <>
                <Moon size={16} />
                <span>Modo Escuro</span>
              </>
            ) : (
              <>
                <Sun size={16} />
                <span>Modo Claro</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area - Unified Centered Card */}
      <main className={styles.mainContent}>
        <div className={styles.unifiedCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLogoBadge}>
              <Building2 size={24} />
            </div>
            <h1 className={styles.cardTitle}>Acesse sua conta</h1>
            <p className={styles.cardSubtitle}>
              Painel de Gestão Financeira, Contas a Receber e Régua de Cobrança
            </p>
          </div>

          {/* Trust Features Strip */}
          <div className={styles.trustBadgesRow}>
            <div className={styles.trustBadgeItem}>
              <ShieldCheck size={18} className={styles.trustBadgeIcon} />
              <span className={styles.trustBadgeLabel}>Auditável</span>
            </div>
            <div className={styles.trustBadgeItem}>
              <Lock size={18} className={styles.trustBadgeIcon} />
              <span className={styles.trustBadgeLabel}>Criptografado</span>
            </div>
            <div className={styles.trustBadgeItem}>
              <CheckCircle2 size={18} className={styles.trustBadgeIcon} />
              <span className={styles.trustBadgeLabel}>Automatizado</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={18} className={styles.errorIcon} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                E-mail corporativo
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  className={styles.inputWithIcon}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.com"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputHeader}>
                <label htmlFor="password" className={styles.label}>
                  Senha
                </label>
                <Link href={ROUTES.ESQUECI_SENHA} className={styles.forgotLink}>
                  Esqueceu a senha?
                </Link>
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.inputWithIcon} ${styles.inputWithIconHasToggle}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              variant="primary"
              className={styles.fullWidthButton}
            >
              Entrar
            </Button>
          </form>

          <div className={styles.divider}>
            <hr className={styles.dividerLine} />
            <span className={styles.dividerText}>ou</span>
            <hr className={styles.dividerLine} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={styles.googleButton}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Entrar com Google
          </button>

          {/* Developer Test Simulator Accordion */}
          <div className={styles.devSimulator}>
            <button
              type="button"
              className={styles.devSimulatorHeader}
              onClick={() => setShowSimulator((prev) => !prev)}
              aria-expanded={showSimulator}
            >
              <div className={styles.devSimulatorTitle}>
                <Sparkles size={14} />
                <span>Simulador de Testes (Dev)</span>
              </div>
              <span className={styles.devSimulatorChevron}>
                {showSimulator ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {showSimulator && (
              <div className={styles.devSimulatorBody}>
                <p className={styles.devSimulatorHint}>
                  Clique em uma das opções abaixo para simular respostas de login:
                </p>
                <div className={styles.devButtonsGroup}>
                  <button
                    type="button"
                    className={styles.devPill}
                    onClick={() => handleTestLoginResponse("pending")}
                    disabled={loading}
                  >
                    <span className={styles.devPillDot} />
                    Erro: Convite Pendente
                  </button>
                  <button
                    type="button"
                    className={styles.devPill}
                    onClick={() => handleTestLoginResponse("incorrect")}
                    disabled={loading}
                  >
                    <span className={styles.devPillDot} />
                    Erro: Senha Incorreta
                  </button>
                  <button
                    type="button"
                    className={styles.devPill}
                    onClick={() => handleTestLoginResponse("notfound")}
                    disabled={loading}
                  >
                    <span className={styles.devPillDot} />
                    Erro: Conta Inexistente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.pageFooter}>
        © 2026 Gestão Finance. Sistema de Gestão de Cobranças e Contas a Receber.
      </footer>
    </div>
  );
}
