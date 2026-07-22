"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { Customer } from "@/types";
import { FormField } from "@/components/forms/form-field";
import { CurrencyInput } from "@/components/forms/currency-input";
import { CustomerSearchSelect } from "@/components/forms/customer-search-select";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTitlePage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Set default issue date to today on mount
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setIssueDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    const newErrors: Record<string, string> = {};

    if (!customer) {
      newErrors.customer = "O cliente é obrigatório.";
    }

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

    setLoading(true);
    try {
      await TitlesService.createTitle({
        customerId: customer!.id,
        originalAmount,
        issueDate,
        dueDate,
      });
      router.push(ROUTES.DASHBOARD); // Or ROUTES.TITLES if there's a titles page, let's redirect to dashboard since it shows critical items and shortcuts
    } catch (err: any) {
      setApiError(err.message || "Erro ao cadastrar título.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 600 }}
    >
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
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={14} />
          <span>Voltar para Títulos</span>
        </Link>
      </div>

      <div>
        <h1 style={{ fontWeight: 700 }}>Novo Título</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Cadastre um título de cobrança manualmente no sistema
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

      <form onSubmit={handleSubmit} className={styles.card}>
        <FormField label="Cliente *" error={errors.customer}>
          <CustomerSearchSelect
            value={customer?.id || ""}
            onChange={setCustomer}
            error={!!errors.customer}
          />
        </FormField>

        {customer && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--colors-surface)",
              border: "1px solid var(--colors-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--colors-muted)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                }}
              >
                Vendedor Associado
              </span>
            </div>
            <div style={{ fontWeight: 600 }}>{customer.sellerName}</div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--colors-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Código do Vendedor: {customer.sellerCode}
            </div>
          </div>
        )}

        <FormField label="Valor do Título (R$) *" error={errors.originalAmount}>
          <CurrencyInput
            value={originalAmount}
            onChange={setOriginalAmount}
            error={!!errors.originalAmount}
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="Data de Emissão *" error={errors.issueDate}>
            <input
              type="date"
              className={`${styles.input} ${errors.issueDate ? styles.inputError : ""}`}
              style={{ fontFamily: "var(--font-mono)" }}
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </FormField>

          <FormField label="Data de Vencimento *" error={errors.dueDate}>
            <input
              type="date"
              className={`${styles.input} ${errors.dueDate ? styles.inputError : ""}`}
              style={{ fontFamily: "var(--font-mono)" }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
            disabled={loading}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
            {loading ? "Salvando..." : "Salvar Título"}
          </button>
        </div>
      </form>
    </div>
  );
}
