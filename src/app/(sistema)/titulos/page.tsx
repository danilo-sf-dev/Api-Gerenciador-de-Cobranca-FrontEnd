"use client";

import React, { useState, useEffect } from "react";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Title, TitleStatus, Customer, PaymentMethod } from "@/types";
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
import { Search, Eye, Calendar, RotateCcw, Plus, XCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";
import pageStyles from "./titulos.module.css";
import { CustomerSearchSelect } from "@/components/forms/customer-search-select";
import { CurrencyInput } from "@/components/forms/currency-input";

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
  LATE: { label: "Em Atraso", badgeClass: styles.badgeLate },
  PAID: { label: "Pago", badgeClass: styles.badgePaid },
  CANCELED: { label: "Cancelado", badgeClass: styles.badgeCanceled },
  RENEGOTIATED: { label: "Renegociado", badgeClass: styles.badgeRenegotiated },
};

export default function TitlesListPage() {
  const { hasPermission } = usePermissions();

  const searchParams = useSearchParams();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderOrInvoice, setOrderOrInvoice] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [dueDateStart, setDueDateStart] = useState("");
  const [dueDateEnd, setDueDateEnd] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<TitleStatus[]>([]);
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [orderOrInvoiceQuery, setOrderOrInvoiceQuery] = useState("");

  // Create Title Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [installmentIntervalDays, setInstallmentIntervalDays] = useState<number>(30);
  const [orderNumber, setOrderNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === "PIX") {
      setInstallmentsCount(1);
    } else if (method === "BOLETO" && installmentsCount > 5) {
      setInstallmentsCount(5);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setCustomerId("");
    setOriginalAmount(0);
    const today = new Date().toISOString().split("T")[0];
    setIssueDate(today);
    setDueDate("");
    setPaymentMethod("PIX");
    setInstallmentsCount(1);
    setInstallmentIntervalDays(30);
    setOrderNumber("");
    setInvoiceNumber("");
    setFormErrors({});
    setApiError("");
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get("novo") === "true") {
      handleOpenCreate();
    }
  }, [searchParams]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setApiError("");

    const errors: Record<string, string> = {};
    if (!customerId) errors.customerId = "Selecione o cliente devedor.";
    if (!originalAmount || originalAmount <= 0)
      errors.originalAmount = "Informe um valor original positivo.";
    if (!orderNumber.trim()) errors.orderNumber = "O número do pedido é obrigatório.";
    if (!invoiceNumber.trim()) errors.invoiceNumber = "O número da nota fiscal é obrigatório.";
    if (!issueDate) errors.issueDate = "A data de emissão é obrigatória.";
    if (!dueDate) errors.dueDate = "A data de vencimento é obrigatória.";
    else if (issueDate && dueDate < issueDate)
      errors.dueDate = "Data de vencimento não pode ser anterior à data de emissão.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await TitlesService.createTitle({
        customerId,
        originalAmount,
        issueDate,
        dueDate,
        paymentMethod,
        installmentsCount: paymentMethod === "PIX" ? 1 : installmentsCount,
        installmentIntervalDays,
        orderNumber: orderNumber.trim(),
        invoiceNumber: invoiceNumber.trim(),
      });
      setIsModalOpen(false);
      loadTitles();
    } catch (err: any) {
      setApiError(err.message || "Erro ao cadastrar título.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce order/invoice input
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderOrInvoiceQuery(orderOrInvoice);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [orderOrInvoice]);

  const loadTitles = async () => {
    setLoading(true);
    try {
      const response = await TitlesService.getTitles({
        page,
        size: 15,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        paymentMethod: filterPaymentMethod ? (filterPaymentMethod as PaymentMethod) : undefined,
        orderOrInvoice: orderOrInvoiceQuery || undefined,
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
  }, [
    page,
    sort,
    searchQuery,
    orderOrInvoiceQuery,
    filterPaymentMethod,
    dueDateStart,
    dueDateEnd,
    selectedStatuses,
  ]);

  const toggleStatus = (status: TitleStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setOrderOrInvoice("");
    setFilterPaymentMethod("");
    setDueDateStart("");
    setDueDateEnd("");
    setSelectedStatuses([]);
    setSort("");
    setPage(1);
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    search ||
    orderOrInvoice ||
    filterPaymentMethod ||
    dueDateStart ||
    dueDateEnd;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", width: "100%" }}
    >
      <div className="pageHeader">
        <div className="pageHeaderText">
          <h1 style={{ fontWeight: 700 }}>Títulos e Cobranças</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Acompanhe a carteira de recebíveis, status de vencimento, pagamentos e renegociações
          </p>
        </div>

        {hasPermission(PERMISSIONS.CREATE_TITLE) && (
          <button
            onClick={handleOpenCreate}
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="button"
          >
            <Plus size={16} />
            <span>Novo Título</span>
          </button>
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

              {hasActiveFilters && (
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

          {/* Search and Advanced Filters grid */}
          <div className={pageStyles.filtersGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Cliente, Documento ou Título</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome, CPF/CNPJ ou nº do título..."
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
              <label className={styles.label}>Nº Pedido ou Nota Fiscal</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="text"
                  value={orderOrInvoice}
                  onChange={(e) => setOrderOrInvoice(e.target.value)}
                  placeholder="Ex: PED-1092, NF-4501..."
                  className={styles.input}
                  style={{ paddingLeft: 36 }}
                />
                <FileText
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
              <label className={styles.label}>Tipo de Pagamento</label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => {
                  setFilterPaymentMethod(e.target.value);
                  setPage(1);
                }}
                className={styles.select}
              >
                <option value="">Todos os tipos</option>
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto Bancário</option>
                <option value="CARD">Cartão de Crédito</option>
              </select>
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
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <SortableHeader label="Título" field="id" currentSort={sort} onSort={setSort} />
              <SortableHeader
                label="Cliente / Documento"
                field="customerName"
                currentSort={sort}
                onSort={setSort}
              />
              <SortableHeader
                label="Pagamento"
                field="paymentMethod"
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
                <td colSpan={9} style={{ padding: 0 }}>
                  <TableLoading rowsCount={8} />
                </td>
              </tr>
            ) : titles.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 0 }}>
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

                const getPaymentLabel = (item: typeof t) => {
                  const map: Record<string, string> = {
                    PIX: "PIX",
                    BOLETO: "Boleto",
                    CARD: "Cartão de Crédito",
                  };
                  const methodStr = map[item.paymentMethod || "PIX"] || item.paymentMethod || "PIX";
                  if (item.totalInstallments && item.totalInstallments > 1) {
                    return `${methodStr} (${item.installmentNumber || 1}/${item.totalInstallments}x)`;
                  }
                  return methodStr;
                };

                return (
                  <tr key={t.id} className={styles.tr}>
                    <td className={`${styles.td} ${pageStyles.codeCell}`}>
                      <div style={{ fontWeight: 600 }}>{t.id}</div>
                      {t.orderNumber && (
                        <div style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                          Ped: {t.orderNumber}
                        </div>
                      )}
                    </td>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600 }}>{t.customerName}</div>
                      <div
                        style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}
                        className="tabular-nums"
                      >
                        {docFormatted}
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontSize: "0.8125rem" }}>
                      <span style={{ fontWeight: 500 }}>{getPaymentLabel(t)}</span>
                      {t.invoiceNumber && (
                        <div style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                          NF: {t.invoiceNumber}
                        </div>
                      )}
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
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          size={15}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Create Title Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <form
            onSubmit={handleCreateSubmit}
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Cadastrar Novo Título</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.modalCloseBtn}
              >
                <XCircle size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {apiError && (
                <div
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "var(--status-late-bg)",
                    border: "1px solid var(--status-late-text)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8125rem",
                    color: "var(--status-late-text)",
                    marginBottom: 12,
                  }}
                >
                  {apiError}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Cliente Devedor *</label>
                <CustomerSearchSelect
                  value={customerId}
                  onChange={(c) => {
                    setSelectedCustomer(c);
                    setCustomerId(c ? c.id : "");
                  }}
                  error={!!formErrors.customerId}
                />
                {formErrors.customerId && (
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--status-late-text)", marginTop: 4 }}
                  >
                    {formErrors.customerId}
                  </span>
                )}
              </div>

              <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                <label className={styles.label}>Valor Original *</label>
                <CurrencyInput
                  value={originalAmount}
                  onChange={setOriginalAmount}
                  error={!!formErrors.originalAmount}
                />
                {formErrors.originalAmount && (
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--status-late-text)", marginTop: 4 }}
                  >
                    {formErrors.originalAmount}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-md)",
                  marginTop: 12,
                }}
              >
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nº do Pedido *</label>
                  <input
                    type="text"
                    className={`${styles.input} ${formErrors.orderNumber ? styles.inputError : ""}`}
                    placeholder="Ex: PED-1092"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                  {formErrors.orderNumber && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {formErrors.orderNumber}
                    </span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nº da Nota Fiscal *</label>
                  <input
                    type="text"
                    className={`${styles.input} ${formErrors.invoiceNumber ? styles.inputError : ""}`}
                    placeholder="Ex: NF-4501"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                  {formErrors.invoiceNumber && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {formErrors.invoiceNumber}
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-md)",
                  marginTop: 12,
                }}
              >
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tipo de Pagamento *</label>
                  <select
                    className={styles.select}
                    value={paymentMethod}
                    onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethod)}
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CARD">Cartão de Crédito</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Forma de Parcelamento *</label>
                  <select
                    className={styles.select}
                    value={paymentMethod === "PIX" ? 1 : installmentsCount}
                    onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                    disabled={paymentMethod === "PIX"}
                  >
                    <option value={1}>À Vista (1x)</option>
                    <option value={2}>Parcelado em 2x</option>
                    <option value={3}>Parcelado em 3x</option>
                    <option value={4}>Parcelado em 4x</option>
                    <option value={5}>Parcelado em 5x</option>
                    {paymentMethod === "CARD" && (
                      <>
                        <option value={6}>Parcelado em 6x</option>
                        <option value={7}>Parcelado em 7x</option>
                        <option value={8}>Parcelado em 8x</option>
                        <option value={9}>Parcelado em 9x</option>
                        <option value={10}>Parcelado em 10x</option>
                        <option value={11}>Parcelado em 11x</option>
                        <option value={12}>Parcelado em 12x</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-md)",
                  marginTop: 12,
                }}
              >
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Data de Emissão *</label>
                  <input
                    type="date"
                    className={`${styles.input} ${formErrors.issueDate ? styles.inputError : ""}`}
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                  {formErrors.issueDate && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {formErrors.issueDate}
                    </span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    {installmentsCount > 1 && paymentMethod !== "PIX"
                      ? "Prazo 1ª Parcela *"
                      : "Data de Vencimento *"}
                  </label>
                  <input
                    type="date"
                    className={`${styles.input} ${formErrors.dueDate ? styles.inputError : ""}`}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  {formErrors.dueDate && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {formErrors.dueDate}
                    </span>
                  )}
                </div>
              </div>

              {installmentsCount > 1 && paymentMethod !== "PIX" && (
                <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                  <label className={styles.label}>Intervalo entre Parcelas (Dias)</label>
                  <select
                    className={styles.select}
                    value={installmentIntervalDays}
                    onChange={(e) => setInstallmentIntervalDays(Number(e.target.value))}
                  >
                    <option value={30}>Mensal (30 dias)</option>
                    <option value={15}>Quinzenal (15 dias)</option>
                    <option value={7}>Semanal (7 dias)</option>
                    <option value={60}>Bimensal (60 dias)</option>
                  </select>
                </div>
              )}

              {installmentsCount > 1 && originalAmount > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    backgroundColor: "var(--colors-surface)",
                    border: "1px solid var(--colors-border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8125rem",
                    color: "var(--colors-ink)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Resumo do Parcelamento:</div>
                  <div>
                    {installmentsCount}x de{" "}
                    <strong>
                      {formatCurrency(Math.round((originalAmount / installmentsCount) * 100) / 100)}
                    </strong>{" "}
                    (Total: {formatCurrency(originalAmount)})
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                {saving ? "Salvando..." : "Confirmar Título"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
