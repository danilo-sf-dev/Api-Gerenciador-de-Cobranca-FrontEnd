"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Briefcase, Shield, UserCog, LogOut, X } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { useAuth } from "@/features/auth/context/auth-context";
import styles from "./layout.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, logout } = useAuth();

  const navItems = [
    {
      label: "Dashboard",
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      permission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
      label: "Títulos",
      href: ROUTES.TITLES,
      icon: FileText,
      permission: PERMISSIONS.VIEW_TITLES,
    },
    {
      label: "Clientes",
      href: ROUTES.CUSTOMERS,
      icon: Users,
      permission: PERMISSIONS.VIEW_CUSTOMERS,
    },
    {
      label: "Vendedores",
      href: ROUTES.SELLERS,
      icon: Briefcase,
      permission: PERMISSIONS.VIEW_SELLERS,
    },
    {
      label: "Cargos",
      href: ROUTES.ROLES,
      icon: Shield,
      permission: PERMISSIONS.VIEW_ROLES,
    },
    {
      label: "Usuários",
      href: ROUTES.USERS,
      icon: UserCog,
      permission: PERMISSIONS.VIEW_USERS,
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.logoArea}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", flex: 1 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "var(--colors-primary)",
            }}
          />
          <span className={styles.logoText}>Trustee Ledger</span>
        </div>
        <button onClick={onClose} className={styles.closeButton} aria-label="Fechar menu">
          <X size={18} />
        </button>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          if (!hasPermission(item.permission)) return null;

          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.sidebarFooter}>
        <button
          onClick={logout}
          className={styles.navLink}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <LogOut size={18} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
