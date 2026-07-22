"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Title, TitleStatus, PaymentMethod, TitleHistory } from "@/types";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Toast } from "@/components/feedback/toast";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatCPF } from "@/lib/formatters/cpf";
import { formatCNPJ } from "@/lib/formatters/cnpj";
import { formatPhone } from "@/lib/formatters/phone";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { ROUTES } from "@/lib/constants/routes";
import { CurrencyInput } from "@/components/forms/currency-input";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Trash2,
  DollarSign,
  User,
  History,
  GitPullRequest,
  CheckCircle2,
  X,
  FileText,
  Edit2,
  XCircle,
} from "lucide-react";
import styles from "@/components/ui/ui.module.css";
import detailStyles from "./detail.module.css";

const STATUS_DETAILS: Record<TitleStatus, { label: string; badgeClass: string }> = {
  UPCOMING: { label: "A Vencer", badgeClass: styles.badgeUpcoming },
  OVERDUE: { label: "Vencido", badgeClass: styles.badgeOverdue },
  LATE: { label: "Atraso", badgeClass: styles.badgeLate },
  PAID: { label: "Pago", badgeClass: styles.badgePaid },
  CANCELED: { label: "Cancelado", badgeClass: styles.badgeCanceled },
  RENEGOTIATED: { label: "Renegociado", badgeClass: styles.badgeRenegotiated },
};

export default function TitleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [title, setTitle] = useState<Title | null>(null);
  const [history, setHistory] = useState<TitleHistory[]>([]);
  const [treeData, setTreeData] = useState<{
    main: Title;
    parent?: Title;
    children: Title[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [paidAt, setPaidAt] = useState("");
  const [registeringPayment, setRegisteringPayment] = useState(false);
  const [cancelingTitle, setCancelingTitle] = useState(false);

  // Edit form state
  const [editOriginalAmount, setEditOriginalAmount] = useState<number>(0);
  const [editIssueDate, setEditIssueDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const titleRes = await TitlesService.getTitleById(id);
      setTitle(titleRes);

      const historyRes = await TitlesService.getTitleHistory(id);
      setHistory(historyRes);

      const treeRes = await TitlesService.getRenegotiationTree(id);
      setTreeData(treeRes);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Erro ao carregar dados do título.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAllData();
      setPaidAt(new Date().toISOString().split("T")[0]);
    }
  }, [id]);

  const handleOpenEditModal = () => {
    if (!title) return;
    setEditOriginalAmount(title.originalAmount);
    setEditIssueDate(title.issueDate);
    setEditDueDate(title.dueDate);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOriginalAmount || editOriginalAmount <= 0) {
      setToast({ message: "Informe um valor original válido.", type: "error" });
      return;
    }
    if (!editIssueDate || !editDueDate) {
      setToast({ message: "Informe as datas de emissão e vencimento.", type: "error" });
      return;
    }
    if (editDueDate < editIssueDate) {
      setToast({ message: "Data de vencimento não pode ser anterior à emissão.", type: "error" });
      return;
    }

    setEditingTitle(true);
    try {
      await TitlesService.updateTitle(id, {
        originalAmount: editOriginalAmount,
        issueDate: editIssueDate,
        dueDate: editDueDate,
      });
      setToast({ message: "Título atualizado com sucesso!", type: "success" });
      setIsEditModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setToast({ message: err.message || "Erro ao atualizar título.", type: "error" });
    } finally {
      setEditingTitle(false);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidAt) {
      setToast({ message: "Selecione a data do pagamento.", type: "error" });
      return;
    }

    setRegisteringPayment(true);
    try {
      await TitlesService.registerPayment(id, paymentMethod, paidAt);
      setToast({ message: "Pagamento registrado com sucesso!", type: "success" });
      setIsPaymentModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setToast({ message: err.message || "Erro ao registrar pagamento.", type: "error" });
    } finally {
      setRegisteringPayment(false);
    }
  };

  const handleCancelTitle = async () => {
    setCancelingTitle(true);
    try {
      await TitlesService.cancelTitle(id);
      setToast({ message: "Título cancelado com sucesso!", type: "success" });
      setIsCancelConfirmOpen(false);
      loadAllData();
    } catch (err: any) {
      setToast({ message: err.message || "Erro ao cancelar título.", type: "error" });
    } finally {
      setCancelingTitle(false);
    }
  };

  if (loading && !title) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}
      >
        <p style={{ color: "var(--colors-muted)" }}>Carregando detalhes do título...</p>
      </div>
    );
  }

  if (!title) {
    return (
      <div style={{ padding: "var(--space-lg)", textAlign: "center" }}>
        <h2>Título Não Encontrado</h2>
        <p style={{ color: "var(--colors-muted)", marginTop: 8 }}>
          O título com código <strong className="tabular-nums">{id}</strong> não foi encontrado ou
          não existe.
        </p>
        <Link
          href={ROUTES.TITLES}
          className={`${styles.btn} ${styles.btnSecondary}`}
          style={{ marginTop: 16 }}
        >
          <ArrowLeft size={16} /> Voltar para Lista
        </Link>
      </div>
    );
  }

  const isUpcoming = title.status === "UPCOMING";
  const isLate = title.status === "LATE";
  const isOverdue = title.status === "OVERDUE";
  const isCanceled = title.status === "CANCELED";
  const isPaid = title.status === "PAID";
  const isRenegotiated = title.status === "RENEGOTIATED";

  const canEdit = isUpcoming && hasPermission(PERMISSIONS.EDIT_TITLE);
  const canRegisterPayment =
    !isPaid && !isCanceled && !isRenegotiated && hasPermission(PERMISSIONS.REGISTER_PAYMENT);
  const canCancel = isUpcoming && hasPermission(PERMISSIONS.CANCEL_TITLE);
  const canRenegotiate = isLate && hasPermission(PERMISSIONS.RENEGOTIATE_TITLE);

  const statusInfo = STATUS_DETAILS[title.status] || { label: title.status, badgeClass: "" };

  const customerDocFormatted =
    title.customerDocument.replace(/\D/g, "").length === 14
      ? formatCNPJ(title.customerDocument)
      : formatCPF(title.customerDocument);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", width: "100%" }}
    >
      {/* Toast feedback */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href={ROUTES.TITLES}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.875rem",
            color: "var(--colors-muted)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          <span>Voltar para Títulos</span>
        </Link>
      </div>

      {/* Actions Header bar */}
      <div className={detailStyles.actionBar}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="tabular-nums" style={{ margin: 0 }}>
              Título {title.id}
            </h1>
            <span
              className={`${styles.badge} ${statusInfo.badgeClass}`}
              style={{ fontSize: "0.875rem", padding: "6px 12px" }}
            >
              {statusInfo.label}
            </span>
          </div>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Visualização de auditoria, transição de estados e fluxos de renegociação
          </p>
        </div>

        <div className={detailStyles.actionButtons}>
          {canEdit && (
            <button
              onClick={handleOpenEditModal}
              className={`${styles.btn} ${styles.btnSecondary}`}
              type="button"
            >
              <Edit2 size={16} />
              <span>Editar Título</span>
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => setIsCancelConfirmOpen(true)}
              className={`${styles.btn} ${styles.btnDanger}`}
              type="button"
            >
              <Trash2 size={16} />
              <span>Cancelar Título</span>
            </button>
          )}

          {canRenegotiate && (
            <Link
              href={`${ROUTES.TITLES}/${title.id}/renegociar`}
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{
                borderColor: "var(--status-renegotiated-text)",
                color: "var(--status-renegotiated-text)",
              }}
            >
              <GitPullRequest size={16} />
              <span>Renegociar</span>
            </Link>
          )}

          {canRegisterPayment && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className={`${styles.btn} ${styles.btnPrimary}`}
              type="button"
            >
              <DollarSign size={16} />
              <span>Registrar Pagamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Section */}
      <div className={styles.card}>
        <div className={detailStyles.sectionHeader}>
          <User size={18} style={{ color: "var(--colors-accent)" }} />
          <h2 className={detailStyles.sectionTitle}>Informações Gerais</h2>
        </div>

        <div className={detailStyles.grid4}>
          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>Cliente</span>
            <span className={detailStyles.infoValue}>{title.customerName}</span>
          </div>

          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>CPF / CNPJ</span>
            <span className={`${detailStyles.infoValueMono} tabular-nums`}>
              {customerDocFormatted}
            </span>
          </div>

          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>Vendedor</span>
            <span className={detailStyles.infoValue}>{title.sellerName}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
              Código: {title.sellerCode}
            </span>
          </div>

          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>Origem</span>
            <span className={detailStyles.infoValue}>
              {title.parentTitleId ? (
                <Link
                  href={`${ROUTES.TITLES}/${title.parentTitleId}`}
                  style={{
                    color: "var(--colors-primary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                  className="tabular-nums"
                >
                  Renegociado de {title.parentTitleId}
                </Link>
              ) : (
                "Cadastro Direto"
              )}
            </span>
          </div>

          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>Tipo de Pagamento</span>
            <span className={detailStyles.infoValue}>
              {title.paymentMethod === "BOLETO"
                ? "Boleto Bancário"
                : title.paymentMethod === "CARD"
                  ? "Cartão de Crédito"
                  : "PIX"}
            </span>
          </div>

          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>Forma de Parcelamento</span>
            <span className={detailStyles.infoValue}>
              {title.totalInstallments && title.totalInstallments > 1
                ? `Parcela ${title.installmentNumber || 1}/${title.totalInstallments}`
                : "À Vista (1x)"}
            </span>
          </div>

          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>Nº do Pedido</span>
            <span className={`${detailStyles.infoValueMono} tabular-nums`}>
              {title.orderNumber || "—"}
            </span>
          </div>

          <div className={detailStyles.infoBlock}>
            <span className={detailStyles.infoLabel}>Nº da Nota Fiscal</span>
            <span className={`${detailStyles.infoValueMono} tabular-nums`}>
              {title.invoiceNumber || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Details Section */}
      <div className={detailStyles.grid2Collapse}>
        {/* Financial info card */}
        <div className={styles.card}>
          <div className={detailStyles.sectionHeader}>
            <DollarSign size={18} style={{ color: "var(--colors-accent)" }} />
            <h2 className={detailStyles.sectionTitle}>Valores do Título</h2>
          </div>

          <div className={detailStyles.grid4} style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div className={detailStyles.infoBlock}>
              <span className={detailStyles.infoLabel}>Valor Original</span>
              <span
                className={`${detailStyles.infoValueMono} tabular-nums`}
                style={{ fontSize: "1.125rem" }}
              >
                {formatCurrency(title.originalAmount)}
              </span>
            </div>

            <div className={detailStyles.infoBlock}>
              <span className={detailStyles.infoLabel}>Valor Atualizado</span>
              <span
                className={`${detailStyles.infoValueMono} tabular-nums`}
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color:
                    title.updatedAmount > title.originalAmount
                      ? "var(--status-late-text)"
                      : "inherit",
                }}
              >
                {formatCurrency(title.updatedAmount)}
              </span>
            </div>

            <div className={detailStyles.infoBlock}>
              <span className={detailStyles.infoLabel}>Multa Calculada</span>
              <span
                className={`${detailStyles.infoValueMono} tabular-nums`}
                style={{ color: title.fineAmount > 0 ? "var(--status-overdue-text)" : "inherit" }}
              >
                {formatCurrency(title.fineAmount)}
              </span>
            </div>

            <div className={detailStyles.infoBlock}>
              <span className={detailStyles.infoLabel}>Juros Acumulados</span>
              <span
                className={`${detailStyles.infoValueMono} tabular-nums`}
                style={{ color: title.interestAmount > 0 ? "var(--status-late-text)" : "inherit" }}
              >
                {formatCurrency(title.interestAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Dates card */}
        <div className={styles.card}>
          <div className={detailStyles.sectionHeader}>
            <Calendar size={18} style={{ color: "var(--colors-accent)" }} />
            <h2 className={detailStyles.sectionTitle}>Datas e Prazos</h2>
          </div>

          <div className={detailStyles.grid4} style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div className={detailStyles.infoBlock}>
              <span className={detailStyles.infoLabel}>Data de Emissão</span>
              <span className={`${detailStyles.infoValueMono} tabular-nums`}>
                {formatDate(title.issueDate)}
              </span>
            </div>

            <div className={detailStyles.infoBlock}>
              <span className={detailStyles.infoLabel}>Vencimento</span>
              <span
                className={`${detailStyles.infoValueMono} tabular-nums`}
                style={{
                  fontWeight: 600,
                  color: isLate || isOverdue ? "var(--status-late-text)" : "inherit",
                }}
              >
                {formatDate(title.dueDate)}
              </span>
            </div>

            {isPaid && (
              <>
                <div className={detailStyles.infoBlock}>
                  <span className={detailStyles.infoLabel}>Pago em</span>
                  <span
                    className={`${detailStyles.infoValueMono} tabular-nums`}
                    style={{ color: "var(--status-paid-text)", fontWeight: 600 }}
                  >
                    {formatDate(title.paidAt)}
                  </span>
                </div>

                <div className={detailStyles.infoBlock}>
                  <span className={detailStyles.infoLabel}>Método de Pagamento</span>
                  <span
                    className={detailStyles.infoValue}
                    style={{ color: "var(--status-paid-text)", fontWeight: 600 }}
                  >
                    {title.paymentMethod}
                  </span>
                </div>
              </>
            )}

            {isRenegotiated && (
              <div className={detailStyles.infoBlock} style={{ gridColumn: "span 2" }}>
                <span className={detailStyles.infoLabel}>Status de Liquidação</span>
                <span
                  className={detailStyles.infoValue}
                  style={{ color: "var(--status-renegotiated-text)" }}
                >
                  Liquido por renegociação. Este título foi desmembrado em novas parcelas.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Renegotiation Tree */}
      {treeData && (treeData.parent || treeData.children.length > 0) && (
        <div className={styles.card}>
          <div className={detailStyles.sectionHeader}>
            <GitPullRequest size={18} style={{ color: "var(--colors-accent)" }} />
            <h2 className={detailStyles.sectionTitle}>Fluxo de Renegociação</h2>
          </div>

          <div className={detailStyles.treeContainer}>
            {/* Parent Title node */}
            {treeData.parent && (
              <>
                <Link
                  href={`${ROUTES.TITLES}/${treeData.parent.id}`}
                  className={detailStyles.treeNode}
                >
                  <div className={detailStyles.treeNodeTitle}>
                    <span>Título Pai (Origem)</span>
                    <span
                      className={`${styles.badge} ${STATUS_DETAILS[treeData.parent.status]?.badgeClass}`}
                    >
                      {STATUS_DETAILS[treeData.parent.status]?.label}
                    </span>
                  </div>
                  <div className={detailStyles.treeNodeCode}>{treeData.parent.id}</div>
                  <div className={detailStyles.treeNodeValue}>
                    {formatCurrency(treeData.parent.originalAmount)}
                  </div>
                  <div className={detailStyles.treeNodeMeta}>
                    <span>Vencimento:</span>
                    <span className="tabular-nums">{formatDate(treeData.parent.dueDate)}</span>
                  </div>
                </Link>
                <div className={detailStyles.treeConnector} />
              </>
            )}

            {/* Current Active Title node */}
            <div className={`${detailStyles.treeNode} ${detailStyles.treeNodeActive}`}>
              <div
                className={detailStyles.treeNodeTitle}
                style={{ color: "var(--colors-primary)" }}
              >
                <span>Título Atual (Foco)</span>
                <span className={`${styles.badge} ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className={detailStyles.treeNodeCode} style={{ color: "var(--colors-primary)" }}>
                {title.id}
              </div>
              <div className={detailStyles.treeNodeValue}>
                {formatCurrency(title.updatedAmount)}
              </div>
              <div className={detailStyles.treeNodeMeta}>
                <span>Vencimento:</span>
                <span
                  className="tabular-nums"
                  style={{ color: "var(--colors-ink)", fontWeight: 600 }}
                >
                  {formatDate(title.dueDate)}
                </span>
              </div>
            </div>

            {/* Children Titles nodes */}
            {treeData.children.length > 0 && (
              <>
                <div className={detailStyles.treeConnector} />
                <div className={detailStyles.treeChildrenGrid}>
                  {treeData.children.map((child) => (
                    <div key={child.id} className={detailStyles.treeChildWrapper}>
                      <div className={detailStyles.treeChildConnector} />
                      <Link href={`${ROUTES.TITLES}/${child.id}`} className={detailStyles.treeNode}>
                        <div className={detailStyles.treeNodeTitle}>
                          <span>Título Filho (Parcela)</span>
                          <span
                            className={`${styles.badge} ${STATUS_DETAILS[child.status]?.badgeClass}`}
                          >
                            {STATUS_DETAILS[child.status]?.label}
                          </span>
                        </div>
                        <div className={detailStyles.treeNodeCode}>{child.id}</div>
                        <div className={detailStyles.treeNodeValue}>
                          {formatCurrency(child.originalAmount)}
                        </div>
                        <div className={detailStyles.treeNodeMeta}>
                          <span>Vencimento:</span>
                          <span className="tabular-nums">{formatDate(child.dueDate)}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Status History (Transition Audit Log) */}
      <div className={styles.card}>
        <div className={detailStyles.sectionHeader}>
          <History size={18} style={{ color: "var(--colors-accent)" }} />
          <h2 className={detailStyles.sectionTitle}>Histórico de Alterações</h2>
        </div>

        <div className={detailStyles.timeline}>
          {history.length === 0 ? (
            <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem" }}>
              Nenhuma transição de status registrada.
            </p>
          ) : (
            history.map((h, index) => {
              const histStatus = STATUS_DETAILS[h.status] || { label: h.status, badgeClass: "" };
              return (
                <div key={h.id} className={detailStyles.timelineItem}>
                  <div
                    className={`${detailStyles.timelineDot} ${index === 0 ? detailStyles.timelineDotActive : ""}`}
                  />
                  <div className={detailStyles.timelineContent}>
                    <div className={detailStyles.timelineHeader}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
                      >
                        <span
                          className={`${styles.badge} ${histStatus.badgeClass}`}
                          style={{ fontSize: "0.6875rem", padding: "2px 6px" }}
                        >
                          {histStatus.label}
                        </span>
                        <span className={detailStyles.timelineReason}>{h.reason}</span>
                      </div>
                      <span className={`${detailStyles.timelineMeta} tabular-nums`}>
                        {formatDateTime(h.createdAt)}
                      </span>
                    </div>
                    <span className={detailStyles.timelineMeta}>
                      Operador: <strong>{h.userName}</strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Title Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <form
            onSubmit={handleEditSubmit}
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Editar Título #{title.id}</span>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className={styles.modalCloseBtn}
              >
                <XCircle size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Cliente (Somente Leitura)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={title.customerName}
                  disabled
                  style={{ backgroundColor: "var(--colors-surface)", color: "var(--colors-muted)" }}
                />
              </div>

              <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                <label className={styles.label}>Valor Original *</label>
                <CurrencyInput value={editOriginalAmount} onChange={setEditOriginalAmount} />
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
                    className={styles.input}
                    value={editIssueDate}
                    onChange={(e) => setEditIssueDate(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Data de Vencimento *</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={editingTitle}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                {editingTitle ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Registrar Modal */}
      {isPaymentModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Registrar Pagamento</span>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className={styles.modalCloseBtn}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment}>
              <div className={styles.modalBody}>
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--colors-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--colors-border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--colors-muted)",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Total a Pagar
                  </div>
                  <div
                    style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}
                    className="tabular-nums"
                  >
                    {formatCurrency(title.updatedAmount)}
                  </div>
                  {title.updatedAmount > title.originalAmount && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      Inclui {formatCurrency(title.fineAmount)} de multa e{" "}
                      {formatCurrency(title.interestAmount)} de juros por atraso.
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Método de Pagamento *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className={styles.select}
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CARD">Cartão de Crédito</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Data do Pagamento *</label>
                  <input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className={styles.input}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  disabled={registeringPayment}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={registeringPayment}
                >
                  {registeringPayment ? "Registrando..." : "Confirmar Pagamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Title Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        title="Cancelar Título"
        message={`Tem certeza de que deseja cancelar o título ${title.id}? Esta ação alterará o status para CANCELADO e registrará a transição no log de auditoria de forma permanente.`}
        confirmLabel={cancelingTitle ? "Cancelando..." : "Confirmar Cancelamento"}
        cancelLabel="Voltar"
        onConfirm={handleCancelTitle}
        onCancel={() => setIsCancelConfirmOpen(false)}
        isDanger
      />
    </div>
  );
}
