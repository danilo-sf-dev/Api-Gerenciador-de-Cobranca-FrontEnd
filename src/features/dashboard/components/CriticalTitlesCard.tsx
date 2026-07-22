"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Title } from "@/types";
import { formatCurrency } from "@/lib/formatters/currency";
import { ROUTES } from "@/lib/constants/routes";
import uiStyles from "@/components/ui/ui.module.css";
import dashboardStyles from "../dashboard.module.css";

interface CriticalTitlesCardProps {
  recentLate: Title[];
}

export function CriticalTitlesCard({ recentLate }: CriticalTitlesCardProps) {
  return (
    <div className={uiStyles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Títulos Críticos para Acompanhamento</h3>
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

      {/* Desktop/Tablet view: >= 640px */}
      <div className={dashboardStyles.responsiveTableWrapper}>
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
                  scope="col"
                  style={{
                    padding: "8px 4px",
                    color: "var(--colors-muted)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  style={{
                    padding: "8px 4px",
                    color: "var(--colors-muted)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Vencimento
                </th>
                <th
                  scope="col"
                  style={{
                    padding: "8px 4px",
                    color: "var(--colors-muted)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Original
                </th>
                <th
                  scope="col"
                  style={{
                    padding: "8px 4px",
                    color: "var(--colors-muted)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Atualizado
                </th>
                <th
                  scope="col"
                  style={{
                    padding: "8px 4px",
                    color: "var(--colors-muted)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {recentLate.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
                    <td style={{ padding: "12px 4px" }}>
                      <div style={{ fontWeight: 600 }}>{t.customerName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                        Vendedor: {t.sellerName}
                      </div>
                    </td>
                    <td style={{ padding: "12px 4px", fontFamily: "var(--font-mono)" }}>
                      {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px 4px", fontFamily: "var(--font-mono)" }}>
                      {formatCurrency(t.originalAmount)}
                    </td>
                    <td
                      style={{
                        padding: "12px 4px",
                        textAlign: "right",
                        fontWeight: 600,
                        color:
                          t.status === "LATE"
                            ? "var(--status-late-text)"
                            : "var(--status-overdue-text)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatCurrency(t.updatedAmount)}
                    </td>
                    <td style={{ padding: "12px 4px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "var(--space-xs)",
                        }}
                      >
                        <Link
                          href={`${ROUTES.TITLES}/${t.id}`}
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--colors-ink)",
                            padding: "4px 8px",
                            border: "1px solid var(--colors-border)",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--colors-surface)",
                            textDecoration: "none",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--colors-border)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--colors-surface)")
                          }
                        >
                          Gerenciar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view: < 640px */}
      <div className={dashboardStyles.mobileCardsWrapper}>
        {recentLate.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--colors-muted)" }}>
            Excelente! Nenhum título vencido ou em atraso.
          </div>
        ) : (
          recentLate.map((t) => {
            const isLate = t.status === "LATE";
            const badgeClass = isLate ? uiStyles.badgeLate : uiStyles.badgeOverdue;
            const cardBg = isLate ? "var(--status-late-bg)" : "var(--status-overdue-bg)";
            const cardBorder = isLate
              ? "color-mix(in srgb, var(--status-late-text) 15%, transparent)"
              : "color-mix(in srgb, var(--status-overdue-text) 15%, transparent)";
            return (
              <div
                key={t.id}
                className={dashboardStyles.mobileCard}
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                }}
              >
                <div className={dashboardStyles.mobileCardHeader}>
                  <div>
                    <div className={dashboardStyles.mobileCardTitle}>{t.customerName}</div>
                    <div className={dashboardStyles.mobileCardSubtitle}>
                      Vendedor: {t.sellerName}
                    </div>
                  </div>
                </div>

                <div className={dashboardStyles.mobileCardBody}>
                  <div className={dashboardStyles.mobileCardRow}>
                    <span className={dashboardStyles.mobileCardLabel}>Vencimento</span>
                    <span className={dashboardStyles.mobileCardValue}>
                      {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className={dashboardStyles.mobileCardRow}>
                    <span className={dashboardStyles.mobileCardLabel}>Valor Original</span>
                    <span className={dashboardStyles.mobileCardValue}>
                      {formatCurrency(t.originalAmount)}
                    </span>
                  </div>
                  <div className={dashboardStyles.mobileCardRow}>
                    <span className={dashboardStyles.mobileCardLabel}>Valor Atualizado</span>
                    <span
                      className={`${uiStyles.badge} ${badgeClass} ${dashboardStyles.mobileCardBadge}`}
                    >
                      {formatCurrency(t.updatedAmount)}
                    </span>
                  </div>
                </div>

                <div className={dashboardStyles.mobileCardFooter}>
                  <Link
                    href={`${ROUTES.TITLES}/${t.id}`}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--colors-ink)",
                      padding: "6px 12px",
                      border: "1px solid var(--colors-border)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--colors-surface)",
                      textDecoration: "none",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--colors-border)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--colors-surface)")
                    }
                  >
                    Gerenciar
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
