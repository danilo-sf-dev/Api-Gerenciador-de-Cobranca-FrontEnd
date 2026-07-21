"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SellersService } from "@/features/vendedores/services/sellers.service";
import { FormField } from "@/components/forms/form-field";
import { CpfInput } from "@/components/forms/cpf-input";
import { PhoneInput } from "@/components/forms/phone-input";
import { validateCPF } from "@/lib/validators/cpf";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function NewSellerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "O nome é obrigatório.";

    const cleanCpf = cpf.replace(/\D/g, "");
    if (!cleanCpf) {
      newErrors.cpf = "O CPF é obrigatório.";
    } else if (cleanCpf.length !== 11 || !validateCPF(cleanCpf)) {
      newErrors.cpf = "CPF inválido. Verifique os dígitos.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "E-mail em formato inválido.";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phone = "O celular é obrigatório.";
    } else if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      newErrors.phone = "Celular deve conter DDD e ter 10 ou 11 dígitos.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await SellersService.createSeller({
        name,
        cpf: cleanCpf,
        email: email || undefined,
        phone: cleanPhone,
        status,
      });
      router.push(ROUTES.SELLERS);
    } catch (err: any) {
      setApiError(err.message || "Erro ao cadastrar vendedor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 600 }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Cadastrar Vendedor</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Adicione um novo vendedor ao sistema
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
        <FormField label="Nome Completo *" error={errors.name}>
          <input
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome do vendedor"
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="CPF *" error={errors.cpf}>
            <CpfInput value={cpf} onChange={setCpf} error={!!errors.cpf} />
          </FormField>

          <FormField label="Celular (com DDD) *" error={errors.phone}>
            <PhoneInput value={phone} onChange={setPhone} error={!!errors.phone} />
          </FormField>
        </div>

        <FormField label="E-mail Corporativo (Opcional)" error={errors.email}>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendedor@empresa.com"
          />
        </FormField>

        <FormField label="Status">
          <select
            className={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </select>
        </FormField>

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
            onClick={() => router.push(ROUTES.SELLERS)}
            disabled={loading}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
            {loading ? "Salvando..." : "Salvar Vendedor"}
          </button>
        </div>
      </form>
    </div>
  );
}
