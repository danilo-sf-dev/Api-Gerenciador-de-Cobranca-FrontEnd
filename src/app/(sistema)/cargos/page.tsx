"use client";

import React, { useState, useEffect } from "react";
import { RolesService } from "@/features/cargos/services/roles.service";
import { Role } from "@/types";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Pagination } from "@/components/data-table/pagination";
import { TableEmptyState } from "@/components/data-table/table-empty-state";
import { TableLoading } from "@/components/data-table/table-loading";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { Edit2, Plus, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function RolesListPage() {
  const { hasPermission } = usePermissions();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("hierarchyLevel,asc");
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [hierarchyLevel, setHierarchyLevel] = useState(4);
  const [roleStatus, setRoleStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setName("");
    setHierarchyLevel(4);
    setRoleStatus("ACTIVE");
    setErrors({});
    setApiError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setName(role.name);
    setHierarchyLevel(role.hierarchyLevel);
    setRoleStatus(role.status);
    setErrors({});
    setApiError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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
      if (selectedRole) {
        await RolesService.updateRole(selectedRole.id, {
          name,
          hierarchyLevel,
          status: roleStatus,
        });
      } else {
        await RolesService.createRole({
          name,
          hierarchyLevel,
          status: roleStatus,
        });
      }
      setIsModalOpen(false);
      loadRoles();
    } catch (err: any) {
      setApiError(err.message || "Erro ao salvar cargo.");
    } finally {
      setSaving(false);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await RolesService.getRoles({
        page,
        sort,
        search: searchQuery,
      });
      setRoles(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to load roles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [page, sort, searchQuery]);

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

  const handleToggleStatus = async (
    id: string,
    name: string,
    currentStatus: "ACTIVE" | "INACTIVE",
  ) => {
    if (!hasPermission(PERMISSIONS.INACTIVATE_ROLE)) return;
    if (name === "Owner" || name === "Gerente" || name === "Vendedor" || name === "Funcionário") {
      return;
    }

    try {
      const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await RolesService.changeRoleStatus(id, nextStatus);
      loadRoles();
    } catch (err: any) {
      console.error(err.message || "Erro ao alterar status do cargo.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <div className="pageHeader">
        <div className="pageHeaderText">
          <h1 style={{ fontWeight: 700 }}>Cargos & Hierarquias</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Configuração dos cargos corporativos dinâmicos e níveis de permissão
          </p>
        </div>

        {hasPermission(PERMISSIONS.CREATE_ROLE) && (
          <button
            onClick={handleOpenCreate}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Plus size={16} />
            <span>Novo Cargo</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className={styles.card} style={{ padding: "var(--space-md)" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do cargo..."
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

      {/* Table Container */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <SortableHeader
                label="Nome do Cargo"
                field="name"
                currentSort={sort}
                onSort={setSort}
              />
              <SortableHeader
                label="Nível Hierárquico"
                field="hierarchyLevel"
                currentSort={sort}
                onSort={setSort}
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
                <td colSpan={4} style={{ padding: 0 }}>
                  <TableLoading rowsCount={5} />
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <TableEmptyState message="Nenhum cargo encontrado." />
                </td>
              </tr>
            ) : (
              roles.map((r) => (
                <tr key={r.id} className={styles.tr}>
                  <td className={styles.td} style={{ fontWeight: 600 }}>
                    {r.name}
                  </td>
                  <td className={`${styles.td} tabular-nums`}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor:
                          r.hierarchyLevel === 1
                            ? "var(--colors-primary-light)"
                            : "var(--colors-surface)",
                        color:
                          r.hierarchyLevel === 1 ? "var(--colors-primary)" : "var(--colors-ink)",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {r.hierarchyLevel}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--colors-muted)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {r.hierarchyLevel === 1 && "(Administrador Supremo)"}
                      {r.hierarchyLevel === 2 && "(Gerência de Equipe)"}
                      {r.hierarchyLevel === 3 && "(Nível Operacional)"}
                      {r.hierarchyLevel >= 4 && "(Acesso Básico)"}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.badge} ${r.status === "ACTIVE" ? styles.badgePaid : styles.badgeCanceled}`}
                    >
                      {r.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className={styles.td} style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      {/* Only allow editing custom roles, or block fundamental name editing inside the edit page */}
                      {hasPermission(PERMISSIONS.EDIT_ROLE) && (
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className={styles.btn}
                          style={{ padding: 6, backgroundColor: "transparent", border: "none", cursor: "pointer" }}
                          title="Editar Cargo"
                        >
                          <Edit2 size={16} style={{ color: "var(--colors-accent)" }} />
                        </button>
                      )}
                      {hasPermission(PERMISSIONS.INACTIVATE_ROLE) &&
                        (() => {
                          const isFundamental =
                            r.name === "Owner" ||
                            r.name === "Gerente" ||
                            r.name === "Vendedor" ||
                            r.name === "Funcionário";
                          return (
                            <button
                              onClick={() => handleToggleStatus(r.id, r.name, r.status)}
                              disabled={isFundamental}
                              className={styles.btn}
                              style={{
                                padding: 6,
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: isFundamental ? "not-allowed" : "pointer",
                                opacity: isFundamental ? 0.4 : 1,
                              }}
                              title={
                                isFundamental
                                  ? "Não é permitido alterar cargos padrão do sistema"
                                  : r.status === "ACTIVE"
                                    ? "Inativar cargo"
                                    : "Ativar cargo"
                              }
                              aria-label={r.status === "ACTIVE" ? "Inativar" : "Ativar"}
                            >
                              {r.status === "ACTIVE" ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 28,
                                    height: 16,
                                    borderRadius: 9999,
                                    backgroundColor: "var(--status-paid-text)",
                                    position: "relative",
                                    transition: "background-color 0.2s",
                                  }}
                                >
                                  <span
                                    style={{
                                      position: "absolute",
                                      right: 2,
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor: "#fff",
                                      transition: "right 0.2s",
                                    }}
                                  />
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 28,
                                    height: 16,
                                    borderRadius: 9999,
                                    backgroundColor: "var(--colors-border)",
                                    position: "relative",
                                    transition: "background-color 0.2s",
                                    border: "1px solid var(--colors-muted)",
                                  }}
                                >
                                  <span
                                    style={{
                                      position: "absolute",
                                      left: 2,
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor: "var(--colors-muted)",
                                      transition: "left 0.2s",
                                    }}
                                  />
                                </span>
                              )}
                            </button>
                          );
                        })()}
                    </div>
                  </td>
                </tr>
              ))
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

      {/* Cargo Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <form
            onSubmit={handleFormSubmit}
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {selectedRole ? `Editar Cargo - ${selectedRole.name}` : "Cadastrar Novo Cargo"}
              </span>
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

              {/* Check if editing a fundamental role to disable name editing */}
              {(() => {
                const isFundamental = !!(selectedRole && (
                  selectedRole.name === "Owner" ||
                  selectedRole.name === "Gerente" ||
                  selectedRole.name === "Vendedor" ||
                  selectedRole.name === "Funcionário"
                ));
                return (
                  <>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Nome do Cargo *</label>
                      <input
                        type="text"
                        className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Gerente Administrativo, Supervisor Regional, etc."
                        disabled={isFundamental}
                        style={
                          isFundamental
                            ? { backgroundColor: "var(--colors-surface)", color: "var(--colors-muted)" }
                            : {}
                        }
                        required
                      />
                      {errors.name && (
                        <span style={{ fontSize: "0.75rem", color: "var(--status-late-text)", marginTop: 4 }}>
                          {errors.name}
                        </span>
                      )}
                      {isFundamental && (
                        <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
                          Cargos padrão do sistema não podem ter seus nomes editados.
                        </p>
                      )}
                    </div>

                    <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                      <label className={styles.label}>Nível Hierárquico *</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className={`${styles.input} ${errors.hierarchyLevel ? styles.inputError : ""}`}
                        value={hierarchyLevel}
                        onChange={(e) => setHierarchyLevel(parseInt(e.target.value) || 0)}
                        disabled={isFundamental}
                        style={
                          isFundamental
                            ? { backgroundColor: "var(--colors-surface)", color: "var(--colors-muted)" }
                            : {}
                        }
                        required
                      />
                      {errors.hierarchyLevel && (
                        <span style={{ fontSize: "0.75rem", color: "var(--status-late-text)", marginTop: 4 }}>
                          {errors.hierarchyLevel}
                        </span>
                      )}
                      {isFundamental ? (
                        <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
                          O nível hierárquico de cargos padrão é fixado pelo sistema.
                        </p>
                      ) : (
                        <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
                          Digite de 1 (mais alto) a 10 (mais baixo).
                        </p>
                      )}
                    </div>

                    <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                      <label className={styles.label}>Status</label>
                      <select
                        className={styles.input}
                        value={roleStatus}
                        onChange={(e) => setRoleStatus(e.target.value as any)}
                        disabled={!!(isFundamental && selectedRole?.name === "Owner")}
                      >
                        <option value="ACTIVE">Ativo</option>
                        <option value="INACTIVE">Inativo</option>
                      </select>
                    </div>
                  </>
                );
              })()}
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
                {saving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
