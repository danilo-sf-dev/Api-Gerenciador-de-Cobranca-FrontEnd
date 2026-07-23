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
import { Edit2, Plus, Search, XCircle } from "lucide-react";
import styles from "@/components/ui/ui.module.css";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { FormField } from "@/components/forms/form-field";
import { CpfInput } from "@/components/forms/cpf-input";
import { PhoneInput } from "@/components/forms/phone-input";
import { validateCPF } from "@/lib/validators/cpf";

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

  // Confirmation states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetSeller, setTargetSeller] = useState<{
    id: string;
    status: "ACTIVE" | "INACTIVE";
  } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sellerStatus, setSellerStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [code, setCode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleOpenCreate = () => {
    setSelectedSeller(null);
    setName("");
    setCpf("");
    setEmail("");
    setPhone("");
    setSellerStatus("ACTIVE");
    setCode("");
    setErrors({});
    setApiError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setName(seller.name);
    setCpf(seller.cpf);
    setEmail(seller.email || "");
    setPhone(seller.phone);
    setSellerStatus(seller.status);
    setCode(seller.code);
    setErrors({});
    setApiError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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

    setSaving(true);
    try {
      if (selectedSeller) {
        await SellersService.updateSeller(selectedSeller.id, {
          name,
          cpf: cleanCpf,
          email: email || undefined,
          phone: cleanPhone,
          status: sellerStatus,
        });
      } else {
        await SellersService.createSeller({
          name,
          cpf: cleanCpf,
          email: email || undefined,
          phone: cleanPhone,
          status: sellerStatus,
        });
      }
      setIsModalOpen(false);
      loadSellers();
    } catch (err: any) {
      setApiError(err.message || "Erro ao salvar vendedor.");
    } finally {
      setSaving(false);
    }
  };

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

  const handleToggleStatus = (id: string, currentStatus: "ACTIVE" | "INACTIVE") => {
    if (!hasPermission(PERMISSIONS.INACTIVATE_SELLER)) return;
    setTargetSeller({ id, status: currentStatus });
    setConfirmOpen(true);
  };

  const executeToggleStatus = async () => {
    if (!targetSeller) return;
    try {
      const nextStatus = targetSeller.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await SellersService.changeSellerStatus(targetSeller.id, nextStatus);
      loadSellers();
    } catch (err: any) {
      console.error(err.message || "Erro ao alterar status do vendedor.");
    } finally {
      setConfirmOpen(false);
      setTargetSeller(null);
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
          <Button onClick={handleOpenCreate} variant="primary" icon={<Plus size={16} />}>
            Novo Vendedor
          </Button>
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
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className={styles.btn}
                          style={{
                            padding: 6,
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="Editar"
                        >
                          <Edit2 size={16} style={{ color: "var(--colors-accent)" }} />
                        </button>
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

      <ConfirmDialog
        isOpen={confirmOpen}
        title={targetSeller?.status === "ACTIVE" ? "Inativar Vendedor" : "Ativar Vendedor"}
        message={
          targetSeller?.status === "ACTIVE"
            ? "Tem certeza de que deseja inativar este vendedor? Ele não poderá ser associado a novos clientes ou títulos."
            : "Tem certeza de que deseja ativar este vendedor?"
        }
        confirmLabel={targetSeller?.status === "ACTIVE" ? "Inativar" : "Ativar"}
        cancelLabel="Cancelar"
        onConfirm={executeToggleStatus}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetSeller(null);
        }}
        isDanger={targetSeller?.status === "ACTIVE"}
      />

      {/* Seller Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <form
            onSubmit={handleFormSubmit}
            noValidate
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {selectedSeller
                  ? `Editar Vendedor - ${selectedSeller.name}`
                  : "Cadastrar Novo Vendedor"}
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

              {selectedSeller && (
                <div className={styles.inputGroup} style={{ marginBottom: 12 }}>
                  <label className={styles.label}>Código de Vendedor (Somente Leitura)</label>
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
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome Completo *</label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite o nome do vendedor"
                />
                {errors.name && (
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--status-late-text)", marginTop: 4 }}
                  >
                    {errors.name}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-md)",
                  marginTop: 12,
                }}
              >
                <div className={styles.inputGroup}>
                  <label className={styles.label}>CPF *</label>
                  <CpfInput value={cpf} onChange={setCpf} error={!!errors.cpf} />
                  {errors.cpf && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {errors.cpf}
                    </span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Celular (com DDD) *</label>
                  <PhoneInput value={phone} onChange={setPhone} error={!!errors.phone} />
                  {errors.phone && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                <label className={styles.label}>E-mail Corporativo (Opcional)</label>
                <input
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendedor@empresa.com"
                />
                {errors.email && (
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--status-late-text)", marginTop: 4 }}
                  >
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.inputGroup} style={{ marginTop: 12 }}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.input}
                  value={sellerStatus}
                  onChange={(e) => setSellerStatus(e.target.value as any)}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={saving} variant="primary">
                Confirmar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
