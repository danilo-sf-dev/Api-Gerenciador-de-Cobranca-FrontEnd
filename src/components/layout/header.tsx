"use client";

import React from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { ShieldAlert, Menu, Sun, Moon } from "lucide-react";
import styles from "./layout.module.css";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, roles, changeRole } = useAuth();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  if (!user) return null;

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      await changeRole(e.target.value);
    } catch (err) {
      alert("Erro ao alterar cargo.");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button onClick={onMenuClick} className={styles.menuButton} aria-label="Abrir menu">
          <Menu size={20} />
        </button>
        <h3
          style={{
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: "var(--colors-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {user.role.name === "Owner" ? "Painel Administrativo" : "Área do Colaborador"}
        </h3>
      </div>
      <div className={styles.headerRight}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          title={theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
          aria-label="Alternar tema"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Role Switcher for dynamic UI permission testing */}
        <div
          className={styles.roleSelector}
          title="Selecione um cargo para testar os privilégios do layout em tempo real."
        >
          <ShieldAlert size={14} style={{ color: "var(--colors-primary)" }} />
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--colors-muted)",
              whiteSpace: "nowrap",
            }}
          >
            Testar Cargo:
          </span>
          <select value={user.role.id} onChange={handleRoleChange} className={styles.roleSelect}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (Lvl {r.hierarchyLevel})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userEmail}>{user.email}</span>
        </div>
      </div>
    </header>
  );
}
