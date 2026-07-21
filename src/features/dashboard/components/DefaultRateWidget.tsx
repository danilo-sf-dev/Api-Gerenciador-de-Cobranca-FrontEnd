"use client";

import React from "react";
import uiStyles from "@/components/ui/ui.module.css";
import dashboardStyles from "../dashboard.module.css";

interface DefaultRateWidgetProps {
  upcomingSum: number;
  overdueSum: number;
  lateSum: number;
  paidSum: number;
}

export function DefaultRateWidget({
  upcomingSum,
  overdueSum,
  lateSum,
  paidSum,
}: DefaultRateWidgetProps) {
  // Calculate default rate (Late + Overdue) / Total Receivables
  const totalReceivables = upcomingSum + overdueSum + lateSum + paidSum;
  const defaultRate =
    totalReceivables > 0 ? (((overdueSum + lateSum) / totalReceivables) * 100).toFixed(1) : "0.0";

  const rate = parseFloat(defaultRate);
  const prevMonthRate = 7.8;
  const diff = rate - prevMonthRate;
  const isUp = diff > 0;
  const formattedDiff = isUp ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
  const deltaBg = isUp ? "var(--status-late-bg)" : "var(--status-paid-bg)";
  const deltaColor = isUp ? "var(--status-late-text)" : "var(--status-paid-text)";

  return (
    <div className={dashboardStyles.delinquencyWidget}>
      <span className={uiStyles.label}>Índice de Inadimplência</span>
      <h2
        className="tabular-nums"
        style={{
          fontSize: "3rem",
          fontWeight: 700,
          margin: "8px 0 4px 0",
          color: rate > 10 ? "var(--status-late-text)" : "var(--colors-ink)",
        }}
      >
        {defaultRate}%
      </h2>

      {/* Trend Indicator */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 8px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: deltaBg,
          color: deltaColor,
          fontSize: "0.75rem",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        <span>{formattedDiff}</span>
        <span style={{ fontWeight: 400, color: "var(--colors-muted)" }}>vs mês anterior</span>
      </div>

      <p className={dashboardStyles.delinquencyWidgetText}>
        Proporção de títulos em atraso ou vencidos em relação à carteira total.
      </p>
    </div>
  );
}
