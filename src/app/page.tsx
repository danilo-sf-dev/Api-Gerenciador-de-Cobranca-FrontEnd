"use client";

import React, { useState, useEffect } from "react";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Title, TitleStatus } from "@/types";
import { formatCurrency } from "@/lib/formatters/currency";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import { useAuth } from "@/features/auth/context/auth-context";
import styles from "@/components/ui/ui.module.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  // Metrics
  const [upcomingSum, setUpcomingSum] = useState(0);
  const [overdueSum, setOverdueSum] = useState(0);
  const [lateSum, setLateSum] = useState(0);
  const [paidSum, setPaidSum] = useState(0);

  const [upcomingCount, setUpcomingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  const [recentLate, setRecentLate] = useState<Title[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await TitlesService.getTitles({ page: 1, size: 100 });
        const allTitles = response.content;
        setTitles(allTitles);

        let upS = 0,
          ovS = 0,
          laS = 0,
          paS = 0;
        let upC = 0,
          ovC = 0,
          laC = 0,
          paC = 0;

        allTitles.forEach((t) => {
          if (t.status === "UPCOMING") {
            upS += t.updatedAmount;
            upC++;
          } else if (t.status === "OVERDUE") {
            ovS += t.updatedAmount;
            ovC++;
          } else if (t.status === "LATE") {
            laS += t.updatedAmount;
            laC++;
          } else if (t.status === "PAID") {
            paS += t.updatedAmount;
            paC++;
          }
        });

        setUpcomingSum(upS);
        setOverdueSum(ovS);
        setLateSum(laS);
        setPaidSum(paS);

        setUpcomingCount(upC);
        setOverdueCount(ovC);
        setLateCount(laC);
        setPaidCount(paC);

        // Filter recent late items
        const lates = allTitles
          .filter((t) => t.status === "LATE" || t.status === "OVERDUE")
          .slice(0, 5);
        setRecentLate(lates);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          height: "60vh",
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
      </div>
    );
  }

  // Calculate default rate (Late + Overdue) / Total Receivables
  const totalReceivables = upcomingSum + overdueSum + lateSum + paidSum;
  const defaultRate =
    totalReceivables > 0 ? (((overdueSum + lateSum) / totalReceivables) * 100).toFixed(1) : "0.0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <div>
        <h1 style={{ fontWeight: 700 }}>Resumo Operacional</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Bem-vindo, {user?.name}. Monitoramento em tempo real do ciclo de cobranças.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-md)",
        }}
      >
        {/* Upcoming */}
        <div className={styles.card} style={{ padding: "var(--space-md)" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <span className="label">A Vencer</span>
            <TrendingUp size={16} style={{ color: "var(--status-upcoming-text)" }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <h2 className="tabular-nums" style={{ fontSize: "1.625rem", fontWeight: 700 }}>
              {formatCurrency(upcomingSum)}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
              {upcomingCount} títulos em aberto
            </p>
          </div>
        </div>

        {/* Overdue */}
        <div className={styles.card} style={{ padding: "var(--space-md)" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <span className="label">Vencidos (Tolerância)</span>
            <Clock size={16} style={{ color: "var(--status-overdue-text)" }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <h2 className="tabular-nums" style={{ fontSize: "1.625rem", fontWeight: 700 }}>
              {formatCurrency(overdueSum)}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
              {overdueCount} títulos vencendo há 1-2 dias
            </p>
          </div>
        </div>

        {/* Late */}
        <div className={styles.card} style={{ padding: "var(--space-md)" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <span className="label">Em Atraso (Cobrança)</span>
            <AlertTriangle size={16} style={{ color: "var(--status-late-text)" }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <h2
              className="tabular-nums"
              style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--status-late-text)" }}
            >
              {formatCurrency(lateSum)}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
              {lateCount} títulos em atraso de 3+ dias
            </p>
          </div>
        </div>

        {/* Paid */}
        <div className={styles.card} style={{ padding: "var(--space-md)" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <span className="label">Recebido</span>
            <CheckCircle2 size={16} style={{ color: "var(--status-paid-text)" }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <h2
              className="tabular-nums"
              style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--status-paid-text)" }}
            >
              {formatCurrency(paidSum)}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
              {paidCount} títulos liquidados
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Shortcuts and Late list */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "var(--space-lg)",
          alignItems: "start",
        }}
      >
        {/* Left Side: Recent Late Attention */}
        <div className={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Títulos Críticos para Acompanhamento
            </h3>
            <Link
              href={ROUTES.TITLES}
              style={{
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 600,
                color: "var(--colors-primary)",
              }}
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--colors-border)" }}>
                  <th
                    style={{
                      padding: "8px 0",
                      color: "var(--colors-muted)",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Cliente
                  </th>
                  <th
                    style={{
                      padding: "8px 0",
                      color: "var(--colors-muted)",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Vencimento
                  </th>
                  <th
                    style={{
                      padding: "8px 0",
                      color: "var(--colors-muted)",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Original
                  </th>
                  <th
                    style={{
                      padding: "8px 0",
                      color: "var(--colors-muted)",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      textAlign: "right",
                    }}
                  >
                    Atualizado
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentLate.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "24px 0",
                        textAlign: "center",
                        color: "var(--colors-muted)",
                      }}
                    >
                      Excelente! Nenhum título vencido ou em atraso.
                    </td>
                  </tr>
                ) : (
                  recentLate.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--colors-border)" }}>
                      <td style={{ padding: "12px 0" }}>
                        <div style={{ fontWeight: 600 }}>{t.customerName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                          Vendedor: {t.sellerName}
                        </div>
                      </td>
                      <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)" }}>
                        {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)" }}>
                        {formatCurrency(t.originalAmount)}
                      </td>
                      <td
                        style={{
                          padding: "12px 0",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "var(--status-late-text)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatCurrency(t.updatedAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Info and Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {/* Default Rate Widget */}
          <div
            className={styles.card}
            style={{
              backgroundColor: "var(--colors-surface)",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "var(--space-lg)",
            }}
          >
            <span className="label">Índice de Inadimplência</span>
            <h2
              className="tabular-nums"
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                margin: "8px 0",
                color:
                  parseFloat(defaultRate) > 10 ? "var(--status-late-text)" : "var(--colors-ink)",
              }}
            >
              {defaultRate}%
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--colors-muted)" }}>
              Proporção de títulos em atraso ou vencidos em relação à carteira total.
            </p>
          </div>

          {/* Quick Actions Card */}
          <div className={styles.card}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Ações Rápidas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              <Link
                href={`${ROUTES.TITLES}/novo`}
                className={styles.btn}
                style={{
                  justifyContent: "flex-start",
                  backgroundColor: "var(--colors-surface)",
                  color: "var(--colors-ink)",
                  border: "1px solid var(--colors-border)",
                }}
              >
                <PlusCircle size={16} style={{ color: "var(--colors-primary)" }} />
                <span>Novo Título</span>
              </Link>
              <Link
                href={`${ROUTES.CUSTOMERS}/novo`}
                className={styles.btn}
                style={{
                  justifyContent: "flex-start",
                  backgroundColor: "var(--colors-surface)",
                  color: "var(--colors-ink)",
                  border: "1px solid var(--colors-border)",
                }}
              >
                <UserPlus size={16} style={{ color: "var(--colors-primary)" }} />
                <span>Novo Cliente</span>
              </Link>
              <Link
                href={`${ROUTES.TITLES}/importar`}
                className={styles.btn}
                style={{
                  justifyContent: "flex-start",
                  backgroundColor: "var(--colors-surface)",
                  color: "var(--colors-ink)",
                  border: "1px solid var(--colors-border)",
                }}
              >
                <FileSpreadsheet size={16} style={{ color: "var(--colors-primary)" }} />
                <span>Importar Planilha</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
