"use client";

import React, { useState, useEffect } from "react";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Title } from "@/types";
import { useAuth } from "@/features/auth/context/auth-context";
import dashboardStyles from "@/features/dashboard/dashboard.module.css";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardKpiGrid } from "@/features/dashboard/components/DashboardKpiGrid";
import { CriticalTitlesCard } from "@/features/dashboard/components/CriticalTitlesCard";
import { DefaultRateWidget } from "@/features/dashboard/components/DefaultRateWidget";
import { QuickActionsCard } from "@/features/dashboard/components/QuickActionsCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [refreshCount, setRefreshCount] = useState(0);

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

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRefreshCount((prev) => prev + 1);
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await TitlesService.getTitles({ page: 1, size: 100 });
        const allTitles = response.content;

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

        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
        setError(
          "Não foi possível carregar as informações do painel. Por favor, verifique sua conexão ou tente novamente.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [refreshCount]);

  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        style={{
          display: "flex",
          flex: 1,
          height: "60vh",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-sm)",
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
        <span className="sr-only">Carregando informações do painel...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "60vh",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-md)",
          padding: "var(--space-lg)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--status-late-text)", fontWeight: 600 }}>{error}</p>
        <button
          onClick={handleRetry}
          style={{
            backgroundColor: "var(--colors-primary)",
            color: "var(--colors-bg)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--colors-primary-hover)")
          }
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--colors-primary)")}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <DashboardHeader user={user} lastSyncTime={lastSyncTime} handleRetry={handleRetry} />

      <DashboardKpiGrid
        upcomingSum={upcomingSum}
        upcomingCount={upcomingCount}
        overdueSum={overdueSum}
        overdueCount={overdueCount}
        lateSum={lateSum}
        lateCount={lateCount}
        paidSum={paidSum}
        paidCount={paidCount}
      />

      <div className={dashboardStyles.bottomGrid}>
        <CriticalTitlesCard recentLate={recentLate} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <DefaultRateWidget
            upcomingSum={upcomingSum}
            overdueSum={overdueSum}
            lateSum={lateSum}
            paidSum={paidSum}
          />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}
