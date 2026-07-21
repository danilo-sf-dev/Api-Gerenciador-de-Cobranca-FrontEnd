"use client";

import React, { useState, useEffect } from "react";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Title, TitleStatus } from "@/types";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Pagination } from "@/components/data-table/pagination";
import { TableEmptyState } from "@/components/data-table/table-empty-state";
import { TableLoading } from "@/components/data-table/table-loading";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { formatCPF } from "@/lib/formatters/cpf";
import { formatCNPJ } from "@/lib/formatters/cnpj";
import { formatDate } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/currency";
import { Search, Eye, Calendar, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";
import pageStyles from "./titulos.module.css";

const STATUS_OPTIONS: { status: TitleStatus; label: string; activeClass: string }[] = [
  { status: "UPCOMING", label: "A vencer", activeClass: pageStyles.filterBadgeActiveUpcoming },
  { status: "OVERDUE", label: "Vencido", activeClass: pageStyles.filterBadgeActiveOverdue },
  { status: "LATE", label: "Atraso", activeClass: pageStyles.filterBadgeActiveLate },
  { status: "PAID", label: "Pago", activeClass: pageStyles.filterBadgeActivePaid },
  { status: "CANCELED", label: "Cancelado", activeClass: pageStyles.filterBadgeActiveCanceled },
  {
    status: "RENEGOTIATED",
    label: "Renegociado",
    activeClass: pageStyles.filterBadgeActiveRenegotiated,
  },
];

const STATUS_DETAILS: Record<TitleStatus, { label: string; badgeClass: string }> = {
  UPCOMING: { label: "A Vencer", badgeClass: styles.badgeUpcoming },
  OVERDUE: { label: "Vencido", badgeClass: styles.badgeOverdue },
  LATE: { label: "Atraso", badgeClass: styles.badgeLate },
  PAID: { label: "Pago", badgeClass: styles.badgePaid },
  CANCELED: { label: "Cancelado", badgeClass: styles.badgeCanceled },
  RENEGOTIATED: { label: "Renegociado", badgeClass: styles.badgeRenegotiated },
};

export default function TitlesListPage() {
  const { hasPermission } = usePermissions();

  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dueDateStart, setDueDateStart] = useState("");
  const [dueDateEnd, setDueDateEnd] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<TitleStatus[]>([]);
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTitles = async () => {
    setLoading(true);
    try {
      const response = await TitlesService.getTitles({
        page,
        size: 15,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        dueDateStart: dueDateStart || undefined,
        dueDateEnd: dueDateEnd || undefined,
        search: searchQuery || undefined,
        sort: sort || undefined,
      });
      setTitles(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to load titles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTitles();
  }, [page, sort, searchQuery, dueDateStart, dueDateEnd, selectedStatuses]);

  const toggleStatus = (status: TitleStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDueDateStart("");
    setDueDateEnd("");
    setSelectedStatuses([]);
    setSort("");
    setPage(1);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", width: "100%" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontWeight: 700 }}>Títulos e Cobranças</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Acompanhe a carteira de recebíveis, status de vencimento, pagamentos e renegociações
          </p>
        </div>

        {hasPermission(PERMISSIONS.CREATE_TITLE) && (
          <Link href={`${ROUTES.TITLES}/novo`} className={`${styles.btn} ${styles.btnPrimary}`}>
            <span>Novo Título</span>
          </Link>
        )}
      </div>

      {/* Filters Card */}
      <div className={styles.card} style={{ padding: "var(--space-md)" }}>
        <div className={pageStyles.filterSection}>
          {/* Status Badge Filters */}
          <div className={pageStyles.statusFilterBar}>
            <span className={pageStyles.statusFilterLabel}>Filtrar por Status</span>
            <div className={pageStyles.statusBadgesList}>
              {STATUS_OPTIONS.map(({ status, label, activeClass }) => {
                const isSelected = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`${pageStyles.filterBadge} ${isSelected ? activeClass : ""}`}
                    type="button"
                  >
                    {label}
                  </button>
                );
              })}

              {(selectedStatuses.length > 0 || search || dueDateStart || dueDateEnd) && (
                <button
                  onClick={clearFilters}
                  className={pageStyles.filterBadge}
                  style={{ borderStyle: "dashed", color: "var(--colors-primary)" }}
                  title="Limpar Filtros"
                  type="button"
                >
                  <RotateCcw size={12} />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Date range filters grid */}
          <div className={pageStyles.filtersGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Buscar cliente, documento ou código</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome do cliente, CPF, CNPJ ou código do título..."
                  className={styles.input}
                  style={{ paddingLeft: 36 }}
                />
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--colors-muted)",
                  }}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Vencimento De</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="date"
                  value={dueDateStart}
                  onChange={(e) => {
                    setDueDateStart(e.target.value);
                    setPage(1);
                  }}
                  className={styles.input}
                  style={{ paddingLeft: 36 }}
                />
                <Calendar
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--colors-muted)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Vencimento Até</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="date"
                  value={dueDateEnd}
                  onChange={(e) => {
                    setDueDateEnd(e.target.value);
                    setPage(1);
                  }}
                  className={styles.input}
                  style={{ paddingLeft: 36 }}
                />
                <Calendar
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--colors-muted)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div
        style={{
          border: "1px solid var(--colors-border)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--colors-bg)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
              textAlign: "left",
            }}
          >
            <thead
              style={{
                backgroundColor: "var(--colors-surface)",
                borderBottom: "1px solid var(--colors-border)",
              }}
            >
              <tr>
                <SortableHeader label="Código" field="id" currentSort={sort} onSort={setSort} />
                <SortableHeader
                  label="Cliente / Documento"
                  field="customerName"
                  currentSort={sort}
                  onSort={setSort}
                />
                <SortableHeader
                  label="Data Emissão"
                  field="issueDate"
                  currentSort={sort}
                  onSort={setSort}
                />
                <SortableHeader
                  label="Vencimento"
                  field="dueDate"
                  currentSort={sort}
                  onSort={setSort}
                />
                <SortableHeader
                  label="Valor Original"
                  field="originalAmount"
                  currentSort={sort}
                  onSort={setSort}
                  alignRight
                />
                <SortableHeader
                  label="Valor Atualizado"
                  field="updatedAmount"
                  currentSort={sort}
                  onSort={setSort}
                  alignRight
                />
                <SortableHeader label="Status" field="status" currentSort={sort} onSort={setSort} />
                <th className={styles.th} style={{ textAlign: "right" }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 0 }}>
                    <TableLoading rowsCount={8} />
                  </td>
                </tr>
              ) : titles.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 0 }}>
                    <TableEmptyState message="Nenhum título encontrado com os filtros selecionados." />
                  </td>
                </tr>
              ) : (
                titles.map((t) => {
                  const statusInfo = STATUS_DETAILS[t.status] || {
                    label: t.status,
                    badgeClass: "",
                  };
                  const docFormatted =
                    t.customerDocument.replace(/\D/g, "").length === 14
                      ? formatCNPJ(t.customerDocument)
                      : formatCPF(t.customerDocument);

                  return (
                    <tr key={t.id} className={styles.tr}>
                      <td className={`${styles.td} ${pageStyles.codeCell}`}>{t.id}</td>
                      <td className={styles.td}>
                        <div style={{ fontWeight: 600 }}>{t.customerName}</div>
                        <div
                          style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}
                          className="tabular-nums"
                        >
                          {docFormatted}
                        </div>
                      </td>
                      <td className={`${styles.td} tabular-nums`}>{formatDate(t.issueDate)}</td>
                      <td
                        className={`${styles.td} tabular-nums`}
                        style={{
                          fontWeight: t.status === "LATE" || t.status === "OVERDUE" ? 600 : 400,
                        }}
                      >
                        {formatDate(t.dueDate)}
                      </td>
                      <td className={`${styles.td} tabular-nums text-right`}>
                        {formatCurrency(t.originalAmount)}
                      </td>
                      <td
                        className={`${styles.td} tabular-nums text-right`}
                        style={{
                          fontWeight: t.updatedAmount > t.originalAmount ? 600 : 400,
                          color:
                            t.updatedAmount > t.originalAmount
                              ? "var(--status-late-text)"
                              : "inherit",
                        }}
                      >
                        {formatCurrency(t.updatedAmount)}
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <Link
                          href={`${ROUTES.TITLES}/${t.id}`}
                          className={pageStyles.actionBtn}
                          title="Ver Detalhes do Título"
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Eye size={14} />
                            <span>Detalhes</span>
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          size={15}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
