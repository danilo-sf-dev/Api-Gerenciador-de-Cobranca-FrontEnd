"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SellersService } from "@/features/vendedores/services/sellers.service";
import { FormField } from "@/components/forms/form-field";
import { CpfInput } from "@/components/forms/cpf-input";
import { PhoneInput } from "@/components/forms/phone-input";
import { validateCPF } from "@/lib/validators/cpf";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function EditSellerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function loadSeller() {
      try {
        const data = await SellersService.getSellerById(id);
        setName(data.name);
        setCpf(data.cpf);
        setEmail(data.email || "");
        setPhone(data.phone);
        setStatus(data.status);
        setCode(data.code);
      } catch (err: any) {
        setApiError(err.message || "Erro ao carregar dados do vendedor.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadSeller();
  }, [id]);

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
      newErrors.cpf = "CPF inválido.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "E-mail em formato inválido.";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phone = "O celular é obrigatório.";
    } else if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      newErrors.phone = "Celular inválido.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await SellersService.updateSeller(id, {
        name,
        cpf: cleanCpf,
        email: email || undefined,
        phone: cleanPhone,
        status,
      });
      router.push(ROUTES.SELLERS);
    } catch (err: any) {
      setApiError(err.message || "Erro ao atualizar vendedor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}
      >
        Carregando dados do vendedor...
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 600 }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Editar Vendedor</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Edite as informações do vendedor e gerencie o status de ativação
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
        <FormField label="Código de Vendedor (Somente Leitura)">
          <input
            type="text"
            className={styles.input}
            style={{
              backgroundColor: "var(--colors-surface)",
              color: "var(--colors-muted)",
              fontFamily: "var(--font-mono)",
            }}
            value={code}
            readOnly
          />
        </FormField>

        <FormField label="Nome Completo *" error={errors.name}>
          <input
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="CPF *" error={errors.cpf}>
            <CpfInput value={cpf} onChange={setCpf} error={!!errors.cpf} />
          </FormField>

          <FormField label="Celular *" error={errors.phone}>
            <PhoneInput value={phone} onChange={setPhone} error={!!errors.phone} />
          </FormField>
        </div>

        <FormField label="E-mail Corporativo (Opcional)" error={errors.email}>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            disabled={saving}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={`${styles.btn} ${styles.btnPrimary}`}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
