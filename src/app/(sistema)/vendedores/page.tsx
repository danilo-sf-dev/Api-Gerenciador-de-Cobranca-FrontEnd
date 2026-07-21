"use client";

import React, { useState, useEffect } from "react";
import { SellersService } from "@/features/vendedores/services/sellers.service";
import { Seller, PageResponse } from "@/types";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Pagination } from "@/components/data-table/pagination";
import { TableEmptyState } from "@/components/data-table/table-empty-state";
import { TableLoading } from "@/components/data-table/table-loading";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { formatCPF } from "@/lib/formatters/cpf";
import { formatPhone } from "@/lib/formatters/phone";
import { Edit2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function SellersListPage() {
  const { hasPermission } = usePermissions();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name,asc");
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounced query state
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1); // Reset to first page
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load sellers
  const loadSellers = async () => {
    setLoading(true);
    try {
      const response = await SellersService.getSellers({
        page,
        sort,
        search: searchQuery,
      });
      setSellers(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to load sellers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, [page, sort, searchQuery]);

  const handleToggleStatus = async (id: string, currentStatus: "ACTIVE" | "INACTIVE") => {
    if (!hasPermission(PERMISSIONS.INACTIVATE_SELLER)) return;
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await SellersService.changeSellerStatus(id, nextStatus);
      loadSellers();
    } catch (err: any) {
      console.error(err.message || "Erro ao alterar status do vendedor.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <div className="pageHeader">
        <div className="pageHeaderText">
          <h1 style={{ fontWeight: 700 }}>Vendedores</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Gerenciamento de vendedores associados a clientes e cobranças
          </p>
        </div>

        {hasPermission(PERMISSIONS.CREATE_SELLER) && (
          <Link href={`${ROUTES.SELLERS}/novo`} className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} />
            <span>Novo Vendedor</span>
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
            placeholder="Buscar por nome, código, CPF ou e-mail..."
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
              <SortableHeader label="Código" field="code" currentSort={sort} onSort={setSort} />
              <SortableHeader label="Nome" field="name" currentSort={sort} onSort={setSort} />
              <th className={styles.th}>CPF</th>
              <th className={styles.th}>E-mail</th>
              <th className={styles.th}>Celular</th>
              <SortableHeader label="Status" field="status" currentSort={sort} onSort={setSort} />
              <th className={styles.th} style={{ textAlign: "right" }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 0 }}>
                  <TableLoading rowsCount={5} />
                </td>
              </tr>
            ) : sellers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 0 }}>
                  <TableEmptyState message="Nenhum vendedor encontrado." />
                </td>
              </tr>
            ) : (
              sellers.map((s) => (
                <tr key={s.id} className={styles.tr}>
                  <td className={`${styles.td} tabular-nums`} style={{ fontWeight: 600 }}>
                    {s.code}
                  </td>
                  <td className={styles.td} style={{ fontWeight: 500 }}>
                    {s.name}
                  </td>
                  <td className={`${styles.td} tabular-nums`}>{formatCPF(s.cpf)}</td>
                  <td className={styles.td}>{s.email || "-"}</td>
                  <td className={`${styles.td} tabular-nums`}>{formatPhone(s.phone)}</td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.badge} ${s.status === "ACTIVE" ? styles.badgePaid : styles.badgeCanceled}`}
                    >
                      {s.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className={styles.td} style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      {hasPermission(PERMISSIONS.EDIT_SELLER) && (
                        <Link
                          href={`${ROUTES.SELLERS}/${s.id}/editar`}
                          className={styles.btn}
                          style={{ padding: 6, backgroundColor: "transparent", border: "none" }}
                          title="Editar"
                        >
                          <Edit2 size={16} style={{ color: "var(--colors-accent)" }} />
                        </Link>
                      )}
                      {hasPermission(PERMISSIONS.INACTIVATE_SELLER) && (
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          className={styles.btn}
                          style={{
                            padding: 6,
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title={s.status === "ACTIVE" ? "Inativar vendedor" : "Ativar vendedor"}
                          aria-label={s.status === "ACTIVE" ? "Inativar" : "Ativar"}
                        >
                          {s.status === "ACTIVE" ? (
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
