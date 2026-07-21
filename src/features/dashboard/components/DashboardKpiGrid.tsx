"use client";

import React from "react";
import { TrendingUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/currency";
import uiStyles from "@/components/ui/ui.module.css";
import dashboardStyles from "../dashboard.module.css";

interface DashboardKpiGridProps {
  upcomingSum: number;
  upcomingCount: number;
  overdueSum: number;
  overdueCount: number;
  lateSum: number;
  lateCount: number;
  paidSum: number;
  paidCount: number;
}

export function DashboardKpiGrid({
  upcomingSum,
  upcomingCount,
  overdueSum,
  overdueCount,
  lateSum,
  lateCount,
  paidSum,
  paidCount,
}: DashboardKpiGridProps) {
  return (
    <div className={dashboardStyles.kpiGrid}>
      {/* Upcoming */}
      <div className={uiStyles.card} style={{ padding: "var(--space-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className={uiStyles.label}>A Vencer</span>
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
      <div className={uiStyles.card} style={{ padding: "var(--space-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className={uiStyles.label}>Vencidos (Tolerância)</span>
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
      <div className={uiStyles.card} style={{ padding: "var(--space-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className={uiStyles.label}>Em Atraso (Cobrança)</span>
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
      <div className={uiStyles.card} style={{ padding: "var(--space-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span className={uiStyles.label}>Recebido</span>
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
  );
}
