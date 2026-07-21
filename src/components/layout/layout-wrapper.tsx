"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuth } from "@/features/auth/context/auth-context";
import styles from "./layout.module.css";
import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // If path is auth, don't show the layout shell
  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/ativar-conta") ||
    pathname?.startsWith("/esqueci-minha-senha") ||
    pathname?.startsWith("/redefinir-senha");

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: "3px solid var(--colors-border)",
            borderTopColor: "var(--colors-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style jsx global>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (isAuthRoute || !user) {
    return <div style={{ width: "100%" }}>{children}</div>;
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
