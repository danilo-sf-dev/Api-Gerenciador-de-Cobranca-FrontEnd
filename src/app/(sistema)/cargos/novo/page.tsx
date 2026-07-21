"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RolesService } from "@/features/cargos/services/roles.service";
import { FormField } from "@/components/forms/form-field";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function NewRolePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [hierarchyLevel, setHierarchyLevel] = useState(4);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "O nome do cargo é obrigatório.";

    if (hierarchyLevel < 1 || hierarchyLevel > 10) {
      newErrors.hierarchyLevel =
        "O nível hierárquico deve ser entre 1 (mais alto) e 10 (mais baixo).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await RolesService.createRole({
        name,
        hierarchyLevel,
        status,
      });
      router.push(ROUTES.ROLES);
    } catch (err: any) {
      setApiError(err.message || "Erro ao cadastrar cargo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 600 }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Cadastrar Cargo</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Cadastre nomenclaturas corporativas e configure a hierarquia de permissões
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
        <FormField label="Nome do Cargo *" error={errors.name}>
          <input
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gerente Administrativo, Supervisor Regional, etc."
          />
        </FormField>

        <FormField label="Nível Hierárquico *" error={errors.hierarchyLevel}>
          <input
            type="number"
            min={1}
            max={10}
            className={`${styles.input} ${errors.hierarchyLevel ? styles.inputError : ""}`}
            value={hierarchyLevel}
            onChange={(e) => setHierarchyLevel(parseInt(e.target.value))}
            placeholder="Digite de 1 a 10 (1 é o Owner, 2 é o Gerente)"
          />
          <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
            O nível hierárquico determina permissões de aprovação e edição automática (níveis
            menores controlam níveis maiores).
          </p>
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
            onClick={() => router.push(ROUTES.ROLES)}
            disabled={loading}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
            {loading ? "Salvando..." : "Salvar Cargo"}
          </button>
        </div>
      </form>
    </div>
  );
}
