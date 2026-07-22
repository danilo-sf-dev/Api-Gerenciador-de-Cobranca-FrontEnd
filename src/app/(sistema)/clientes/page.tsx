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
import { Edit2, Plus, Search, XCircle } from "lucide-react";
import styles from "@/components/ui/ui.module.css";
import { FormField } from "@/components/forms/form-field";
import { CpfInput } from "@/components/forms/cpf-input";
import { CnpjInput } from "@/components/forms/cnpj-input";
import { PhoneInput } from "@/components/forms/phone-input";
import { SellerSearchSelect } from "@/components/forms/seller-search-select";
import { validateDocument } from "@/lib/validators/cnpj";

export default function CustomersListPage() {
  const { hasPermission } = usePermissions();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sellerCode, setSellerCode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleDocumentTypeChange = (type: "CPF" | "CNPJ") => {
    setDocumentType(type);
    setDocument("");
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.document;
      return copy;
    });
  };

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setName("");
    setDocumentType("CPF");
    setDocument("");
    setEmail("");
    setPhone("");
    setSellerCode("");
    setErrors({});
    setApiError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setName(customer.name);
    setDocumentType(customer.documentType);
    setDocument(customer.document);
    setEmail(customer.email || "");
    setPhone(customer.phone || "");
    setSellerCode(customer.sellerCode);
    setErrors({});
    setApiError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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
      if (selectedCustomer) {
        await CustomersService.updateCustomer(selectedCustomer.id, {
          name,
          document: cleanDoc,
          documentType,
          email: email || undefined,
          phone: cleanPhone || undefined,
          sellerCode,
        });
      } else {
        await CustomersService.createCustomer({
          name,
          document: cleanDoc,
          documentType,
          email: email || undefined,
          phone: cleanPhone || undefined,
          sellerCode,
          sellerName: "",
        });
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      setApiError(err.message || "Erro ao salvar cliente.");
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
      <div className="pageHeader">
        <div className="pageHeaderText">
          <h1 style={{ fontWeight: 700 }}>Clientes</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Visualização e cadastro de carteira de clientes associados
          </p>
        </div>

        {hasPermission(PERMISSIONS.CREATE_CUSTOMER) && (
          <button onClick={handleOpenCreate} className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} />
            <span>Novo Cliente</span>
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
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className={styles.btn}
                        style={{
                          padding: 6,
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        title="Editar Cliente"
                      >
                        <Edit2 size={16} style={{ color: "var(--colors-accent)" }} />
                      </button>
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

      {/* Client Create/Edit Modal */}
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
                {selectedCustomer
                  ? `Editar Cliente - ${selectedCustomer.name}`
                  : "Cadastrar Novo Cliente"}
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

              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome / Razão Social *</label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite o nome completo ou razão social"
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
                  <label className={styles.label}>Tipo de Documento</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-md)",
                      height: 38,
                      alignItems: "center",
                    }}
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
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Documento ({documentType}) *</label>
                  {documentType === "CPF" ? (
                    <CpfInput value={document} onChange={setDocument} error={!!errors.document} />
                  ) : (
                    <CnpjInput value={document} onChange={setDocument} error={!!errors.document} />
                  )}
                  {errors.document && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {errors.document}
                    </span>
                  )}
                </div>
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
                  <label className={styles.label}>E-mail (Opcional)</label>
                  <input
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@exemplo.com"
                  />
                  {errors.email && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--status-late-text)",
                        marginTop: 4,
                      }}
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Telefone (Opcional)</label>
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
                <label className={styles.label}>Vendedor Associado *</label>
                <SellerSearchSelect
                  value={sellerCode}
                  onChange={setSellerCode}
                  error={!!errors.sellerCode}
                />
                {errors.sellerCode && (
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--status-late-text)", marginTop: 4 }}
                  >
                    {errors.sellerCode}
                  </span>
                )}
              </div>
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
