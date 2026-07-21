"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Title, TitleStatus } from "@/types";
import { CurrencyInput } from "@/components/forms/currency-input";
import { Toast } from "@/components/feedback/toast";
import { formatDate } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatCPF } from "@/lib/formatters/cpf";
import { formatCNPJ } from "@/lib/formatters/cnpj";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { ROUTES } from "@/lib/constants/routes";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
  DollarSign,
} from "lucide-react";
import styles from "@/components/ui/ui.module.css";
import pageStyles from "./renegociar.module.css";

export default function RenegotiateTitlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { hasPermission } = usePermissions();

  const [title, setTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [reason, setReason] = useState("");
  const [installments, setInstallments] = useState<{ dueDate: string; amount: number }[]>([]);

  useEffect(() => {
    const loadTitle = async () => {
      setLoading(true);
      try {
        const data = await TitlesService.getTitleById(id);

        // State machine validation: Only LATE (Atraso) titles can be renegotiated
        if (data.status !== "LATE") {
          setToast({
            message: `Este título não pode ser renegociado. Status atual: ${data.status}. Somente títulos em status Atraso são permitidos.`,
            type: "error",
          });
        }

        setTitle(data);

        // Initialize with 1 installment equal to the total negotiated amount
        setInstallments([
          {
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Today + 30 days
            amount: data.updatedAmount,
          },
        ]);
      } catch (err: any) {
        console.error(err);
        setToast({ message: err.message || "Erro ao carregar dados do título.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTitle();
    }
  }, [id]);

  // Calculations
  const totalToNegotiate = title ? title.updatedAmount : 0;
  const sumInstallments = installments.reduce((sum, inst) => sum + inst.amount, 0);
  const roundedSum = Math.round(sumInstallments * 100) / 100;
  const difference = Math.round((totalToNegotiate - roundedSum) * 100) / 100;
  const isBalanced = Math.abs(difference) === 0;

  const handleAddInstallment = () => {
    // Determine next default date: 30 days after the last installment, or 30 days from now
    let nextDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (installments.length > 0) {
      const lastDate = new Date(installments[installments.length - 1].dueDate);
      if (!isNaN(lastDate.getTime())) {
        lastDate.setDate(lastDate.getDate() + 30);
        nextDateStr = lastDate.toISOString().split("T")[0];
      }
    }

    setInstallments([
      ...installments,
      {
        dueDate: nextDateStr,
        amount: 0,
      },
    ]);
  };

  const handleRemoveInstallment = (index: number) => {
    if (installments.length <= 1) return;
    setInstallments(installments.filter((_, idx) => idx !== index));
  };

  const handleUpdateInstallment = (index: number, field: "dueDate" | "amount", value: any) => {
    setInstallments(
      installments.map((inst, idx) => {
        if (idx !== index) return inst;
        return {
          ...inst,
          [field]: value,
        };
      }),
    );
  };

  // Helper: Distributes total amount equally, handling rounding adjustments in the last installment
  const distributeEqually = () => {
    const qty = installments.length;
    if (qty === 0 || !title) return;

    const baseAmount = Math.floor((totalToNegotiate / qty) * 100) / 100;
    const remainder = Math.round((totalToNegotiate - baseAmount * qty) * 100) / 100;

    const distributed = installments.map((inst, idx) => {
      const isLast = idx === qty - 1;
      return {
        ...inst,
        amount: isLast ? Math.round((baseAmount + remainder) * 100) / 100 : baseAmount,
      };
    });

    setInstallments(distributed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.RENEGOTIATE_TITLE)) {
      setToast({ message: "Você não tem permissão para realizar esta operação.", type: "error" });
      return;
    }

    if (!isBalanced) {
      setToast({
        message: `O valor das parcelas (${formatCurrency(roundedSum)}) não coincide com o valor negociado (${formatCurrency(totalToNegotiate)}). Ajuste a diferença de ${formatCurrency(difference)} antes de prosseguir.`,
        type: "error",
      });
      return;
    }

    if (!reason.trim()) {
      setToast({ message: "Digite o motivo da renegociação.", type: "error" });
      return;
    }

    // Validate installments dates and amounts
    const hasInvalidInstallment = installments.some((inst) => !inst.dueDate || inst.amount <= 0);
    if (hasInvalidInstallment) {
      setToast({
        message:
          "Todas as parcelas devem possuir data de vencimento válida e valor maior que zero.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await TitlesService.renegotiateTitle(id, installments, reason.trim());
      setToast({ message: "Renegociação concluída com sucesso!", type: "success" });

      // Redirect back to details page
      setTimeout(() => {
        router.push(`${ROUTES.TITLES}/${id}`);
      }, 1500);
    } catch (err: any) {
      setToast({ message: err.message || "Erro ao renegociar título.", type: "error" });
      setSubmitting(false);
    }
  };

  if (loading && !title) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}
      >
        <p style={{ color: "var(--colors-muted)" }}>Carregando dados para renegociação...</p>
      </div>
    );
  }

  if (!title) {
    return (
      <div style={{ padding: "var(--space-lg)", textAlign: "center" }}>
        <h2>Título Não Encontrado</h2>
        <Link
          href={ROUTES.TITLES}
          className={`${styles.btn} ${styles.btnSecondary}`}
          style={{ marginTop: 16 }}
        >
          Voltar para Lista
        </Link>
      </div>
    );
  }

  // Double-check if the status is LATE
  const isLate = title.status === "LATE";

  const docFormatted =
    title.customerDocument.replace(/\D/g, "").length === 14
      ? formatCNPJ(title.customerDocument)
      : formatCPF(title.customerDocument);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", width: "100%" }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <Link
          href={`${ROUTES.TITLES}/${id}`}
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
          <span>Voltar para Detalhes do Título</span>
        </Link>
      </div>

      <div>
        <h1 style={{ fontWeight: 700 }} className="tabular-nums">
          Renegociar Título {title.id}
        </h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Desmembre o saldo total devedor em uma ou mais parcelas customizadas.
        </p>
      </div>

      {!isLate ? (
        <div
          className={styles.card}
          style={{
            borderColor: "var(--status-late-text)",
            backgroundColor: "var(--status-late-bg)",
            color: "var(--status-late-text)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={24} />
            <div>
              <strong style={{ display: "block", fontSize: "1rem" }}>Operação Não Permitida</strong>
              <span style={{ fontSize: "0.875rem" }}>
                Este título está no status <strong>{title.status}</strong>. A renegociação é
                permitida apenas para títulos em atraso (LATE, 3+ dias após o vencimento).
              </span>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}
        >
          {/* Summary Dashboard Header */}
          <div className={pageStyles.summaryGrid}>
            <div className={pageStyles.summaryBox}>
              <span className={pageStyles.summaryLabel}>Total a Renegociar</span>
              <span className={pageStyles.summaryValue}>{formatCurrency(totalToNegotiate)}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                Original: {formatCurrency(title.originalAmount)} + Encargos
              </span>
            </div>

            <div className={pageStyles.summaryBox}>
              <span className={pageStyles.summaryLabel}>Total Alocado</span>
              <span className={pageStyles.summaryValue}>{formatCurrency(roundedSum)}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                Soma das parcelas geradas
              </span>
            </div>

            <div
              className={`${pageStyles.summaryBox} ${isBalanced ? pageStyles.summaryBoxActive : ""}`}
            >
              <span className={pageStyles.summaryLabel}>Diferença</span>
              <span
                className={pageStyles.summaryValue}
                style={{
                  color: isBalanced ? "var(--status-paid-text)" : "var(--status-late-text)",
                }}
              >
                {formatCurrency(difference)}
              </span>
              {isBalanced ? (
                <span className={pageStyles.differenceSuccess}>Valores conciliados!</span>
              ) : (
                <span className={pageStyles.differenceWarning}>
                  {difference > 0 ? "Falta alocar saldo" : "Valor excedeu o limite"}
                </span>
              )}
            </div>
          </div>

          <div className={pageStyles.grid2Collapse}>
            {/* Installments Setup card */}
            <div className={pageStyles.renegCard}>
              <div className={pageStyles.instHeader}>
                <span className={pageStyles.instTitle}>Parcelas da Renegociação</span>
                <button
                  type="button"
                  onClick={distributeEqually}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  title="Divide o valor total igualmente entre as parcelas criadas"
                >
                  <Sparkles size={14} style={{ color: "var(--colors-primary)" }} />
                  <span>Distribuir Igualmente</span>
                </button>
              </div>

              <div className={pageStyles.instList}>
                {installments.map((inst, index) => (
                  <div key={index} className={pageStyles.instRow}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Parcela {index + 1}</div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ fontSize: "0.6875rem" }}>
                        Vencimento
                      </label>
                      <input
                        type="date"
                        value={inst.dueDate}
                        onChange={(e) => handleUpdateInstallment(index, "dueDate", e.target.value)}
                        className={styles.input}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ fontSize: "0.6875rem" }}>
                        Valor da Parcela
                      </label>
                      <CurrencyInput
                        value={inst.amount}
                        onChange={(val) => handleUpdateInstallment(index, "amount", val)}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveInstallment(index)}
                        className={pageStyles.removeBtn}
                        disabled={installments.length <= 1}
                        title="Remover Parcela"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddInstallment}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  style={{ width: "100%", borderStyle: "dashed" }}
                >
                  <Plus size={16} />
                  <span>Adicionar Parcela</span>
                </button>
              </div>
            </div>

            {/* Negotiation details / metadata card */}
            <div className={pageStyles.renegCard} style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <div className={pageStyles.sectionHeader} style={{ marginBottom: 0 }}>
                  <DollarSign size={18} style={{ color: "var(--colors-accent)" }} />
                  <h2 className={pageStyles.sectionTitle}>Resumo do Acordo</h2>
                </div>

                <div
                  style={{
                    fontSize: "0.875rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "12px",
                    backgroundColor: "var(--colors-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--colors-border)",
                  }}
                >
                  <div>
                    Devedor: <strong>{title.customerName}</strong>
                  </div>
                  <div className="tabular-nums">
                    Documento: <strong>{docFormatted}</strong>
                  </div>
                  <div>
                    Vendedor Associado: <strong>{title.sellerName}</strong>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Motivo da Renegociação</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Descreva o motivo ou acordo feito com o cliente..."
                    className={styles.input}
                    style={{ minHeight: 100, resize: "vertical", fontFamily: "inherit" }}
                    required
                  />
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}
              >
                <Link
                  href={`${ROUTES.TITLES}/${id}`}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ flex: 2 }}
                  disabled={submitting || !isBalanced || !reason.trim()}
                >
                  <Check size={16} />
                  <span>{submitting ? "Processando..." : "Confirmar Acordo"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
