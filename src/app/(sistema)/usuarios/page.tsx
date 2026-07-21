"use client";

import React, { useState, useEffect } from "react";
import { UsersService } from "@/features/usuarios/services/users.service";
import { RolesService } from "@/features/cargos/services/roles.service";
import { User, Role, RoleHistory } from "@/types";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Pagination } from "@/components/data-table/pagination";
import { TableEmptyState } from "@/components/data-table/table-empty-state";
import { TableLoading } from "@/components/data-table/table-loading";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { UserPlus, UserCog, RefreshCw, XCircle, Search } from "lucide-react";
import styles from "@/components/ui/ui.module.css";

export default function UsersListPage() {
  const {
    user: currentUser,
    hasPermission,
    hierarchyLevel: currentHierarchyLevel,
  } = usePermissions();

  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<RoleHistory[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Users params
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name,asc");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // History params
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Change Role Modal State
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetRoleId, setTargetRoleId] = useState("");
  const [promotionType, setPromotionType] = useState<"PERMANENT" | "TEMPORARY">("PERMANENT");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [roleError, setRoleError] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setUserPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await UsersService.getUsers({
        page: userPage,
        sort,
        search: searchQuery,
      });
      setUsers(response.content);
      setUserTotal(response.totalElements);
      setUserTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await UsersService.getRoleHistory({ page: historyPage });
      setHistory(response.content);
      setHistoryTotal(response.totalElements);
      setHistoryTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error loading role change logs", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [userPage, sort, searchQuery]);

  useEffect(() => {
    loadHistory();
  }, [historyPage]);

  useEffect(() => {
    async function loadRoles() {
      try {
        const list = await RolesService.getActiveRoles();
        setRoles(list);
      } catch (err) {
        console.error("Error loading roles", err);
      }
    }
    loadRoles();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    if (!inviteName.trim() || !inviteEmail.trim() || !inviteRoleId) {
      setInviteError("Por favor, preencha todos os campos.");
      return;
    }

    setInviteLoading(true);
    try {
      await UsersService.inviteUser({
        name: inviteName,
        email: inviteEmail,
        roleId: inviteRoleId,
      });
      setIsInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRoleId("");
      loadUsers();
    } catch (err: any) {
      setInviteError(err.message || "Erro ao enviar convite.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResendInvite = async (id: string) => {
    if (!hasPermission(PERMISSIONS.RESEND_INVITATION)) {
      alert("Sem permissão.");
      return;
    }
    try {
      await UsersService.resendInvitation(id);
      alert("Convite reenviado com sucesso!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!hasPermission(PERMISSIONS.CANCEL_INVITATION)) {
      alert("Sem permissão.");
      return;
    }
    if (window.confirm("Tem certeza de que deseja cancelar e excluir este convite pendente?")) {
      try {
        await UsersService.cancelInvitation(id);
        loadUsers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const openChangeRoleModal = (user: User) => {
    // Check hierarchy: current user must be higher than selected user (numerically lower) OR be Owner
    if (currentUser?.role.name !== "Owner" && currentHierarchyLevel >= user.role.hierarchyLevel) {
      alert(
        `Permissão negada. Você não possui nível hierárquico suficiente para alterar o cargo de ${user.name}.`,
      );
      return;
    }

    setSelectedUser(user);
    setTargetRoleId(user.role.id);
    setPromotionType("PERMANENT");
    setStartDate("");
    setEndDate("");
    setReason("");
    setRoleError("");
    setIsRoleOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleError("");

    if (!selectedUser) return;

    if (!targetRoleId) {
      setRoleError("Selecione um cargo de destino.");
      return;
    }

    if (reason.trim().length < 10 || reason.trim().length > 100) {
      setRoleError("O motivo é obrigatório e deve ter entre 10 e 100 caracteres.");
      return;
    }

    if (promotionType === "TEMPORARY") {
      if (!startDate || !endDate) {
        setRoleError("As datas de início e fim são obrigatórias para cargo temporário.");
        return;
      }
      if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
        setRoleError("A data de término deve ser posterior à data de início.");
        return;
      }
    }

    setRoleLoading(true);
    try {
      await UsersService.changeUserRole({
        userId: selectedUser.id,
        roleId: targetRoleId,
        type: promotionType,
        reason: reason.trim(),
        startDate: promotionType === "TEMPORARY" ? startDate : undefined,
        endDate: promotionType === "TEMPORARY" ? endDate : undefined,
      });
      setIsRoleOpen(false);
      loadUsers();
      loadHistory();
    } catch (err: any) {
      setRoleError(err.message || "Erro ao alterar cargo do usuário.");
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontWeight: 700 }}>Gestão de Usuários</h1>
          <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            Total de usuários registrados no tenant:{" "}
            <span style={{ fontWeight: 600, color: "var(--colors-ink)" }}>{userTotal}</span>
          </p>
        </div>

        {hasPermission(PERMISSIONS.INVITE_USER) && (
          <button
            onClick={() => {
              setInviteError("");
              setIsInviteOpen(true);
            }}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <UserPlus size={16} />
            <span>Convidar Usuário</span>
          </button>
        )}
      </div>

      {/* Search toolbar */}
      <div className={styles.card} style={{ padding: "var(--space-md)" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou cargo..."
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

      {/* Users table */}
      <div
        style={{
          border: "1px solid var(--colors-border)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--colors-bg)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
              textAlign: "left",
            }}
          >
            <thead
              style={{
                backgroundColor: "var(--colors-surface)",
                borderBottom: "1px solid var(--colors-border)",
              }}
            >
              <tr>
                <SortableHeader label="Usuário" field="name" currentSort={sort} onSort={setSort} />
                <th className={styles.th}>Cargo / Perfil</th>
                <SortableHeader label="Status" field="status" currentSort={sort} onSort={setSort} />
                <th className={styles.th}>Último Login</th>
                <th className={styles.th} style={{ textAlign: "right" }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <TableLoading rowsCount={5} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <TableEmptyState message="Nenhum usuário encontrado." />
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isPending = u.status === "PENDING_INVITATION";
                  const isActive = u.status === "ACTIVE";

                  let statusBadgeClass = styles.badgeCanceled;
                  let statusText = "Inativo";
                  if (isPending) {
                    statusBadgeClass = styles.badgeOverdue;
                    statusText = "Convite Pendente";
                  } else if (isActive) {
                    statusBadgeClass = styles.badgePaid;
                    statusText = "Ativo";
                  }

                  return (
                    <tr key={u.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                          {u.email}
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span
                          className={`${styles.badge} ${styles.badgeUpcoming}`}
                          style={{ borderRadius: 4 }}
                        >
                          {u.role.name}
                        </span>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: "0.75rem",
                            color: "var(--colors-muted)",
                          }}
                        >
                          Nível {u.role.hierarchyLevel}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${statusBadgeClass}`}>{statusText}</span>
                      </td>
                      <td className={`${styles.td} tabular-nums`}>
                        {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Sem registros"}
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                          {isPending && hasPermission(PERMISSIONS.RESEND_INVITATION) && (
                            <button
                              onClick={() => handleResendInvite(u.id)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                              title="Reenviar link de ativação"
                            >
                              <RefreshCw size={12} /> Reenviar
                            </button>
                          )}
                          {isPending && hasPermission(PERMISSIONS.CANCEL_INVITATION) && (
                            <button
                              onClick={() => handleCancelInvite(u.id)}
                              className={`${styles.btn} ${styles.btnDanger}`}
                              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                              title="Cancelar convite"
                            >
                              <XCircle size={12} /> Cancelar
                            </button>
                          )}
                          {!isPending && hasPermission(PERMISSIONS.CHANGE_USER_ROLE) && (
                            <button
                              onClick={() => openChangeRoleModal(u)}
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                              title="Alterar Cargo"
                            >
                              <UserCog size={14} /> Cargo
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={userPage}
          size={15}
          totalElements={userTotal}
          totalPages={userTotalPages}
          onPageChange={setUserPage}
        />
      </div>

      {/* Role Change History Section */}
      <div style={{ marginTop: "var(--space-md)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-sm)" }}>
          Histórico de Alterações Hierárquicas & Auditoria
        </h3>

        <div
          style={{
            border: "1px solid var(--colors-border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--colors-bg)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              <thead
                style={{
                  backgroundColor: "var(--colors-surface)",
                  borderBottom: "1px solid var(--colors-border)",
                }}
              >
                <tr>
                  <th className={styles.th}>Data da Alteração</th>
                  <th className={styles.th}>Usuário</th>
                  <th className={styles.th}>Transição</th>
                  <th className={styles.th}>Tipo</th>
                  <th className={styles.th}>Motivo / Justificativa</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "16px", textAlign: "center" }}>
                      Carregando log de auditoria...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 0 }}>
                      <TableEmptyState message="Nenhum log de alteração registrado." />
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} style={{ borderBottom: "1px solid var(--colors-border)" }}>
                      <td
                        className={`${styles.td} tabular-nums`}
                        style={{ fontSize: "0.8125rem", color: "var(--colors-muted)" }}
                      >
                        {formatDateTime(h.createdAt)}
                      </td>
                      <td className={styles.td}>
                        <div style={{ fontWeight: 600 }}>{h.userName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                          {h.userEmail}
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 500 }}>{h.fromRoleName}</span>
                        <span style={{ margin: "0 6px", color: "var(--colors-muted)" }}>
                          &rarr;
                        </span>
                        <span style={{ fontWeight: 600, color: "var(--colors-primary)" }}>
                          {h.toRoleName}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span
                          className={`${styles.badge} ${h.type === "TEMPORARY" ? styles.badgeOverdue : styles.badgePaid}`}
                          style={{ borderRadius: 4 }}
                        >
                          {h.type === "TEMPORARY" ? "Temporário" : "Permanente"}
                        </span>
                        {h.type === "TEMPORARY" && h.startDate && h.endDate && (
                          <div
                            style={{
                              fontSize: "0.70rem",
                              color: "var(--colors-muted)",
                              marginTop: 4,
                            }}
                          >
                            Período: {formatDate(h.startDate)} até {formatDate(h.endDate)}
                          </div>
                        )}
                      </td>
                      <td
                        className={styles.td}
                        style={{ fontSize: "0.8125rem", maxWidth: 300, wordWrap: "break-word" }}
                      >
                        {h.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={historyPage}
            size={15}
            totalElements={historyTotal}
            totalPages={historyTotalPages}
            onPageChange={setHistoryPage}
          />
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleInviteSubmit} className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Convidar Novo Usuário</span>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className={styles.modalCloseBtn}
              >
                <XCircle size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {inviteError && (
                <div
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "var(--status-late-bg)",
                    border: "1px solid var(--status-late-text)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8125rem",
                    color: "var(--status-late-text)",
                  }}
                >
                  {inviteError}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome Completo</label>
                <input
                  type="text"
                  className={styles.input}
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>E-mail Corporativo</label>
                <input
                  type="email"
                  className={styles.input}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Cargo Inicial</label>
                <select
                  className={styles.input}
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(e.target.value)}
                  required
                >
                  <option value="">Selecione um cargo corporativo...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Nível {r.hierarchyLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={inviteLoading}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                {inviteLoading ? "Enviando..." : "Enviar Convite"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Role Modal */}
      {isRoleOpen && selectedUser && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleRoleSubmit} className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Alterar Perfil de {selectedUser.name}</span>
              <button
                type="button"
                onClick={() => setIsRoleOpen(false)}
                className={styles.modalCloseBtn}
              >
                <XCircle size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {roleError && (
                <div
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "var(--status-late-bg)",
                    border: "1px solid var(--status-late-text)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8125rem",
                    color: "var(--status-late-text)",
                  }}
                >
                  {roleError}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Novo Cargo de Destino</label>
                <select
                  className={styles.input}
                  value={targetRoleId}
                  onChange={(e) => setTargetRoleId(e.target.value)}
                  required
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Nível {r.hierarchyLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment type: Permanent or Temporary toggle */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tipo de Atribuição</label>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
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
                      name="promotionType"
                      value="PERMANENT"
                      checked={promotionType === "PERMANENT"}
                      onChange={() => setPromotionType("PERMANENT")}
                    />
                    Permanente
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
                      name="promotionType"
                      value="TEMPORARY"
                      checked={promotionType === "TEMPORARY"}
                      onChange={() => setPromotionType("TEMPORARY")}
                    />
                    Temporário
                  </label>
                </div>
              </div>

              {promotionType === "TEMPORARY" && (
                <div
                  style={{
                    border: "1px solid var(--colors-border)",
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--colors-surface)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "var(--colors-muted)",
                    }}
                  >
                    Configuração do Período Temporário
                  </span>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ fontSize: "0.70rem" }}>
                        Data de Início
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ fontSize: "0.70rem" }}>
                        Data de Término
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)" }}>
                    A conta reverterá automaticamente para o cargo anterior ao expirar o prazo.
                  </p>
                </div>
              )}

              <div className={styles.inputGroup}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className={styles.label}>Motivo da Alteração *</label>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color:
                        reason.length < 10 || reason.length > 100
                          ? "var(--status-late-text)"
                          : "var(--status-paid-text)",
                    }}
                  >
                    {reason.length}/100 caract. (mín. 10)
                  </span>
                </div>
                <textarea
                  className={styles.input}
                  style={{ height: 60, resize: "none" }}
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, 100))}
                  placeholder="Justifique a mudança de nível hierárquico..."
                  required
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsRoleOpen(false)}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={roleLoading}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                {roleLoading ? "Salvando..." : "Confirmar Alteração"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
