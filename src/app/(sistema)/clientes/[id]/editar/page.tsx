"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CustomersService } from "@/features/clientes/services/customers.service";
import { FormField } from "@/components/forms/form-field";
import { CpfInput } from "@/components/forms/cpf-input";
import { CnpjInput } from "@/components/forms/cnpj-input";
import { PhoneInput } from "@/components/forms/phone-input";
import { SellerSearchSelect } from "@/components/forms/seller-search-select";
import { validateDocument } from "@/lib/validators/cnpj";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";
import { Button } from "@/components/ui/button";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sellerCode, setSellerCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const data = await CustomersService.getCustomerById(id);
        setName(data.name);
        setDocumentType(data.documentType);
        setDocument(data.document);
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setSellerCode(data.sellerCode);
      } catch (err: any) {
        setApiError(err.message || "Erro ao carregar dados do cliente.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCustomer();
  }, [id]);

  const handleDocumentTypeChange = (type: "CPF" | "CNPJ") => {
    setDocumentType(type);
    setDocument("");
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.document;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "O nome/razão social é obrigatório.";
    }

    const cleanDoc = document.replace(/\D/g, "");
    const expectedLength = documentType === "CPF" ? 11 : 14;

    if (!cleanDoc) {
      newErrors.document = `O ${documentType} é obrigatório.`;
    } else if (cleanDoc.length !== expectedLength) {
      newErrors.document = `O ${documentType} deve conter ${expectedLength} dígitos.`;
    } else if (!validateDocument(cleanDoc)) {
      newErrors.document = `${documentType} inválido. Verifique os dígitos.`;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "E-mail em formato inválido.";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
      newErrors.phone = "Telefone deve conter DDD e ter 10 ou 11 dígitos.";
    }

    if (!sellerCode) {
      newErrors.sellerCode = "O vendedor associado é obrigatório.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await CustomersService.updateCustomer(id, {
        name,
        document: cleanDoc,
        documentType,
        email: email || undefined,
        phone: cleanPhone || undefined,
        sellerCode,
      });
      router.push(ROUTES.CUSTOMERS);
    } catch (err: any) {
      setApiError(err.message || "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}
      >
        Carregando dados do cliente...
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 600 }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Editar Cliente</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Edite as informações cadastrais e o vendedor associado
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
        <FormField label="Nome / Razão Social *" error={errors.name}>
          <input
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="Tipo de Documento">
            <div
              style={{ display: "flex", gap: "var(--space-md)", height: 38, alignItems: "center" }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="documentType"
                  checked={documentType === "CPF"}
                  onChange={() => handleDocumentTypeChange("CPF")}
                  style={{ accentColor: "var(--colors-primary)" }}
                />
                <span>CPF</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="documentType"
                  checked={documentType === "CNPJ"}
                  onChange={() => handleDocumentTypeChange("CNPJ")}
                  style={{ accentColor: "var(--colors-primary)" }}
                />
                <span>CNPJ</span>
              </label>
            </div>
          </FormField>

          <FormField label={`Documento (${documentType}) *`} error={errors.document}>
            {documentType === "CPF" ? (
              <CpfInput value={document} onChange={setDocument} error={!!errors.document} />
            ) : (
              <CnpjInput value={document} onChange={setDocument} error={!!errors.document} />
            )}
          </FormField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="E-mail (Opcional)" error={errors.email}>
            <input
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Telefone (Opcional)" error={errors.phone}>
            <PhoneInput value={phone} onChange={setPhone} error={!!errors.phone} />
          </FormField>
        </div>

        <FormField label="Vendedor Associado *" error={errors.sellerCode}>
          <SellerSearchSelect
            value={sellerCode}
            onChange={setSellerCode}
            error={!!errors.sellerCode}
          />
        </FormField>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: 8,
          }}
        >
          <Button
            type="button"
            onClick={() => router.push(ROUTES.CUSTOMERS)}
            disabled={saving}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button type="submit" loading={saving} variant="primary">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
