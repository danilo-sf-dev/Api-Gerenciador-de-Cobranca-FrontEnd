"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Title } from "@/types";
import { FormField } from "@/components/forms/form-field";
import { CurrencyInput } from "@/components/forms/currency-input";
import { ROUTES } from "@/lib/constants/routes";
import { formatCPF } from "@/lib/formatters/cpf";
import { formatCNPJ } from "@/lib/formatters/cnpj";
import styles from "@/components/ui/ui.module.css";

export default function EditTitlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [title, setTitle] = useState<Title | null>(null);
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function loadTitle() {
      try {
        const data = await TitlesService.getTitleById(id);
        setTitle(data);
        setOriginalAmount(data.originalAmount);
        setIssueDate(data.issueDate);
        setDueDate(data.dueDate);
      } catch (err: any) {
        setApiError(err.message || "Erro ao carregar dados do título.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadTitle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || title.status !== "UPCOMING") return;

    setErrors({});
    setApiError("");

    const newErrors: Record<string, string> = {};

    if (originalAmount <= 0) {
      newErrors.originalAmount = "O valor do título deve ser maior que zero.";
    }

    if (!issueDate) {
      newErrors.issueDate = "A data de emissão é obrigatória.";
    }

    if (!dueDate) {
      newErrors.dueDate = "A data de vencimento é obrigatória.";
    } else if (issueDate && new Date(dueDate) < new Date(issueDate)) {
      newErrors.dueDate = "A data de vencimento não pode ser anterior à data de emissão.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await TitlesService.updateTitle(id, {
        originalAmount,
        issueDate,
        dueDate,
      });
      router.push(ROUTES.DASHBOARD); // Or back to titles page/details page
    } catch (err: any) {
      setApiError(err.message || "Erro ao atualizar título.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: "3px solid var(--colors-border)",
            borderTopColor: "var(--colors-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginRight: 8,
          }}
        />
        <span>Carregando dados do título...</span>
      </div>
    );
  }

  const isEditable = title?.status === "UPCOMING";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 600 }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Editar Título</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Edite as informações financeiras e de vencimento do título
        </p>
      </div>

      {apiError && (
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "var(--status-late-bg)",
            border: "1px solid var(--status-late-text)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem",
            color: "var(--status-late-text)",
          }}
        >
          {apiError}
        </div>
      )}

      {!isEditable && title && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--status-canceled-bg)",
            border: "1px solid var(--colors-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.875rem",
            color: "var(--colors-ink)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xs)",
          }}
        >
          <div style={{ fontWeight: 600 }}>Edição Bloqueada</div>
          <div>
            Este título está no status{" "}
            <strong>
              {title.status === "PAID" && "Pago"}
              {title.status === "CANCELED" && "Cancelado"}
              {title.status === "RENEGOTIATED" && "Renegociado"}
              {title.status === "LATE" && "Atraso (3+ dias)"}
              {title.status === "OVERDUE" && "Vencido (1-2 dias)"}
            </strong>
            . Apenas títulos no status <strong>A vencer</strong> podem ser alterados manualmente.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.card}>
        <FormField label="Cliente (Somente Leitura)">
          <input
            type="text"
            className={styles.input}
            style={{ backgroundColor: "var(--colors-surface)", color: "var(--colors-muted)" }}
            value={
              title
                ? `${title.customerName} — ${title.customerDocument.length === 11 ? formatCPF(title.customerDocument) : formatCNPJ(title.customerDocument)}`
                : ""
            }
            readOnly
          />
        </FormField>

        <FormField label="Vendedor Associado (Somente Leitura)">
          <input
            type="text"
            className={styles.input}
            style={{
              backgroundColor: "var(--colors-surface)",
              color: "var(--colors-muted)",
              fontFamily: "var(--font-mono)",
            }}
            value={title ? `${title.sellerName} (Código: ${title.sellerCode})` : ""}
            readOnly
          />
        </FormField>

        <FormField label="Valor do Título (R$) *" error={errors.originalAmount}>
          <CurrencyInput
            value={originalAmount}
            onChange={setOriginalAmount}
            error={!!errors.originalAmount}
            disabled={!isEditable || saving}
            style={
              !isEditable
                ? { backgroundColor: "var(--colors-surface)", color: "var(--colors-muted)" }
                : {}
            }
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="Data de Emissão *" error={errors.issueDate}>
            <input
              type="date"
              className={`${styles.input} ${errors.issueDate ? styles.inputError : ""}`}
              style={
                !isEditable
                  ? {
                      backgroundColor: "var(--colors-surface)",
                      color: "var(--colors-muted)",
                      fontFamily: "var(--font-mono)",
                    }
                  : { fontFamily: "var(--font-mono)" }
              }
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              disabled={!isEditable || saving}
            />
          </FormField>

          <FormField label="Data de Vencimento *" error={errors.dueDate}>
            <input
              type="date"
              className={`${styles.input} ${errors.dueDate ? styles.inputError : ""}`}
              style={
                !isEditable
                  ? {
                      backgroundColor: "var(--colors-surface)",
                      color: "var(--colors-muted)",
                      fontFamily: "var(--font-mono)",
                    }
                  : { fontFamily: "var(--font-mono)" }
              }
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={!isEditable || saving}
            />
          </FormField>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Voltar
          </button>
          {isEditable && (
            <button
              type="submit"
              disabled={saving}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
