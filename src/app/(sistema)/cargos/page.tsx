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
import { Edit2, ToggleLeft, ToggleRight, Plus, Search } from "lucide-react";
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

  const handleToggleStatus = async (
    id: string,
    name: string,
    currentStatus: "ACTIVE" | "INACTIVE",
  ) => {
    if (!hasPermission(PERMISSIONS.INACTIVATE_ROLE)) {
      alert("Você não tem permissão para alterar o status de um cargo.");
      return;
    }

    if (name === "Owner" || name === "Gerente" || name === "Vendedor" || name === "Funcionário") {
      alert("Não é permitido desativar cargos fundamentais do sistema.");
      return;
    }

    const confirmMessage =
      currentStatus === "ACTIVE"
        ? `Tem certeza de que deseja inativar o cargo "${name}"? Usuários não poderão ser associados a cargos inativos.`
        : `Tem certeza de que deseja ativar o cargo "${name}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        await RolesService.changeRoleStatus(id, nextStatus);
        loadRoles();
      } catch (err: any) {
        alert(err.message || "Erro ao alterar status do cargo.");
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontWeight: 700 }}>Cargos & Hierarquias</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Configuração dos cargos corporativos dinâmicos e níveis de permissão
          </p>
        </div>

        {hasPermission(PERMISSIONS.CREATE_ROLE) && (
          <Link href={`${ROUTES.ROLES}/novo`} className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} />
            <span>Novo Cargo</span>
          </Link>
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
                          <Link
                            href={`${ROUTES.ROLES}/${r.id}/editar`}
                            className={styles.btn}
                            style={{ padding: 6, backgroundColor: "transparent", border: "none" }}
                            title="Editar Cargo"
                          >
                            <Edit2 size={16} style={{ color: "var(--colors-accent)" }} />
                          </Link>
                        )}
                        {hasPermission(PERMISSIONS.INACTIVATE_ROLE) && (
                          <button
                            onClick={() => handleToggleStatus(r.id, r.name, r.status)}
                            disabled={
                              r.name === "Owner" ||
                              r.name === "Gerente" ||
                              r.name === "Vendedor" ||
                              r.name === "Funcionário"
                            }
                            className={styles.btn}
                            style={{
                              padding: 6,
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                            title={r.status === "ACTIVE" ? "Inativar" : "Ativar"}
                          >
                            {r.status === "ACTIVE" ? (
                              <ToggleRight
                                size={20}
                                style={{
                                  color:
                                    r.name === "Owner" ||
                                    r.name === "Gerente" ||
                                    r.name === "Vendedor" ||
                                    r.name === "Funcionário"
                                      ? "var(--colors-border)"
                                      : "var(--status-paid-text)",
                                }}
                              />
                            ) : (
                              <ToggleLeft size={20} style={{ color: "var(--colors-muted)" }} />
                            )}
                          </button>
                        )}
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
    </div>
  );
}
