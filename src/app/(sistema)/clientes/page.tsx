"use client";

import React, { useState, useEffect } from "react";
import { CustomersService } from "@/features/clientes/services/customers.service";
import { Customer } from "@/types";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Pagination } from "@/components/data-table/pagination";
import { TableEmptyState } from "@/components/data-table/table-empty-state";
import { TableLoading } from "@/components/data-table/table-loading";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { formatCPF } from "@/lib/formatters/cpf";
import { formatCNPJ } from "@/lib/formatters/cnpj";
import { formatPhone } from "@/lib/formatters/phone";
import { formatDate } from "@/lib/formatters/date";
import { Edit2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";
import styles from "@/components/ui/ui.module.css";

export default function CustomersListPage() {
  const { hasPermission } = usePermissions();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name,asc");
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

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await CustomersService.getCustomers({
        page,
        sort,
        search: searchQuery,
      });
      setCustomers(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, sort, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontWeight: 700 }}>Clientes</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Visualização e cadastro de carteira de clientes associados
          </p>
        </div>

        {hasPermission(PERMISSIONS.CREATE_CUSTOMER) && (
          <Link href={`${ROUTES.CUSTOMERS}/novo`} className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} />
            <span>Novo Cliente</span>
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
            placeholder="Buscar por nome do cliente, documento ou vendedor..."
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

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
                <SortableHeader
                  label="Cliente / Razão Social"
                  field="name"
                  currentSort={sort}
                  onSort={setSort}
                />
                <th className={styles.th}>CPF / CNPJ</th>
                <th className={styles.th}>E-mail</th>
                <th className={styles.th}>Telefone</th>
                <SortableHeader
                  label="Vendedor Associado"
                  field="sellerName"
                  currentSort={sort}
                  onSort={setSort}
                />
                <SortableHeader
                  label="Cadastrado em"
                  field="createdAt"
                  currentSort={sort}
                  onSort={setSort}
                />
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <TableEmptyState message="Nenhum cliente encontrado." />
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                    </td>
                    <td className={`${styles.td} tabular-nums`} style={{ fontSize: "0.8125rem" }}>
                      {c.documentType === "CPF" ? formatCPF(c.document) : formatCNPJ(c.document)}
                    </td>
                    <td className={styles.td}>{c.email || "-"}</td>
                    <td className={`${styles.td} tabular-nums`}>
                      {c.phone ? formatPhone(c.phone) : "-"}
                    </td>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 500 }}>{c.sellerName}</div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--colors-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        Código: {c.sellerCode}
                      </div>
                    </td>
                    <td className={`${styles.td} tabular-nums`}>{formatDate(c.createdAt)}</td>
                    <td className={styles.td} style={{ textAlign: "right" }}>
                      {hasPermission(PERMISSIONS.EDIT_CUSTOMER) && (
                        <Link
                          href={`${ROUTES.CUSTOMERS}/${c.id}/editar`}
                          className={styles.btn}
                          style={{ padding: 6, backgroundColor: "transparent", border: "none" }}
                          title="Editar Cliente"
                        >
                          <Edit2 size={16} style={{ color: "var(--colors-accent)" }} />
                        </Link>
                      )}
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
