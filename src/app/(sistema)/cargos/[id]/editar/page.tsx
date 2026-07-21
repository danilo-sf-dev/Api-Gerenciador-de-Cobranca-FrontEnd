"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { RolesService } from "@/features/cargos/services/roles.service";
import { FormField } from "@/components/forms/form-field";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState("");
  const [hierarchyLevel, setHierarchyLevel] = useState(4);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const [isDefaultRole, setIsDefaultRole] = useState(false);

  useEffect(() => {
    async function loadRole() {
      try {
        const data = await RolesService.getRoleById(id);
        setName(data.name);
        setHierarchyLevel(data.hierarchyLevel);
        setStatus(data.status);

        // Check if fundamental role
        if (
          data.name === "Owner" ||
          data.name === "Gerente" ||
          data.name === "Vendedor" ||
          data.name === "Funcionário"
        ) {
          setIsDefaultRole(true);
        }
      } catch (err: any) {
        setApiError(err.message || "Erro ao carregar dados do cargo.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadRole();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "O nome do cargo é obrigatório.";

    if (hierarchyLevel < 1 || hierarchyLevel > 10) {
      newErrors.hierarchyLevel = "O nível hierárquico deve ser entre 1 e 10.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await RolesService.updateRole(id, {
        name,
        hierarchyLevel,
        status,
      });
      router.push(ROUTES.ROLES);
    } catch (err: any) {
      setApiError(err.message || "Erro ao atualizar cargo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}
      >
        Carregando dados do cargo...
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 600 }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Editar Cargo</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Edite as regras de hierarquias do cargo
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
            disabled={isDefaultRole}
            style={
              isDefaultRole
                ? { backgroundColor: "var(--colors-surface)", color: "var(--colors-muted)" }
                : {}
            }
          />
          {isDefaultRole && (
            <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
              Cargos padrão do sistema não podem ter seus nomes editados.
            </p>
          )}
        </FormField>

        <FormField label="Nível Hierárquico *" error={errors.hierarchyLevel}>
          <input
            type="number"
            min={1}
            max={10}
            className={`${styles.input} ${errors.hierarchyLevel ? styles.inputError : ""}`}
            value={hierarchyLevel}
            onChange={(e) => setHierarchyLevel(parseInt(e.target.value))}
            disabled={isDefaultRole}
            style={
              isDefaultRole
                ? { backgroundColor: "var(--colors-surface)", color: "var(--colors-muted)" }
                : {}
            }
          />
          {isDefaultRole ? (
            <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
              O nível hierárquico de cargos padrão é fixado pelo sistema.
            </p>
          ) : (
            <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
              Digite de 1 (mais alto) a 10 (mais baixo).
            </p>
          )}
        </FormField>

        <FormField label="Status">
          <select
            className={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            disabled={isDefaultRole && name === "Owner"} // owner status must remain active
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
