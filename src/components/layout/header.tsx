"use client";

import React from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { ShieldAlert } from "lucide-react";
import styles from "./layout.module.css";

export function Header() {
  const { user, roles, changeRole } = useAuth();

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
        <h3 style={{ fontWeight: 500, fontSize: "0.9375rem", color: "var(--colors-muted)" }}>
          {user.role.name === "Owner" ? "Painel Administrativo" : "Área do Colaborador"}
        </h3>
      </div>
      <div className={styles.headerRight}>
        {/* Role Switcher for dynamic UI permission testing */}
        <div
          className={styles.roleSelector}
          title="Selecione um cargo para testar os privilégios do layout em tempo real."
        >
          <ShieldAlert size={14} style={{ color: "var(--colors-primary)" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--colors-muted)" }}>
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
