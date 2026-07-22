import { CustomersService } from "@/features/clientes/services/customers.service";
import { SellersService } from "@/features/vendedores/services/sellers.service";
import { RolesService } from "@/features/cargos/services/roles.service";
import { TitlesService } from "@/features/titulos/services/titles.service";
import { UsersService } from "@/features/usuarios/services/users.service";
import { AuthService } from "@/features/auth/services/auth.service";

/**
 * Roteador de Mock Adapter para redirecionar chamadas REST quando a URL do Backend Java estiver vazia.
 */
export const mockAdapter = {
  async handle<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: any,
    params?: Record<string, any>,
  ): Promise<T> {
    const cleanPath = path.split("?")[0];
    const safeParams = params || { page: 1 };

    // Autenticação
    if (cleanPath === "/api/v1/auth/login" && method === "POST") {
      return (await AuthService.login(body.email, body.password)) as unknown as T;
    }
    if (cleanPath === "/api/v1/auth/me" && method === "GET") {
      return (await AuthService.getCurrentUser()) as unknown as T;
    }

    // Clientes
    if (cleanPath === "/api/v1/customers" && method === "GET") {
      return (await CustomersService.getCustomers({
        page: Number(safeParams.page) || 1,
        size: safeParams.size ? Number(safeParams.size) : undefined,
        search: safeParams.search,
        sort: safeParams.sort,
      })) as unknown as T;
    }
    if (cleanPath === "/api/v1/customers/active" && method === "GET") {
      return (await CustomersService.getActiveCustomerList()) as unknown as T;
    }
    if (cleanPath === "/api/v1/customers" && method === "POST") {
      return (await CustomersService.createCustomer(body)) as unknown as T;
    }
    if (cleanPath.startsWith("/api/v1/customers/") && method === "PUT") {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 1];
      return (await CustomersService.updateCustomer(id, body)) as unknown as T;
    }

    // Vendedores
    if (cleanPath === "/api/v1/sellers" && method === "GET") {
      return (await SellersService.getSellers({
        page: Number(safeParams.page) || 1,
        size: safeParams.size ? Number(safeParams.size) : undefined,
        search: safeParams.search,
        sort: safeParams.sort,
      })) as unknown as T;
    }
    if (cleanPath === "/api/v1/sellers/active" && method === "GET") {
      return (await SellersService.searchSellers("")) as unknown as T;
    }
    if (cleanPath === "/api/v1/sellers" && method === "POST") {
      return (await SellersService.createSeller(body)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/status") &&
      cleanPath.startsWith("/api/v1/sellers/") &&
      method === "PATCH"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await SellersService.changeSellerStatus(id, body.status)) as unknown as T;
    }
    if (cleanPath.startsWith("/api/v1/sellers/") && method === "PUT") {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 1];
      return (await SellersService.updateSeller(id, body)) as unknown as T;
    }

    // Cargos
    if (cleanPath === "/api/v1/roles" && method === "GET") {
      return (await RolesService.getRoles({
        page: Number(safeParams.page) || 1,
        size: safeParams.size ? Number(safeParams.size) : undefined,
        search: safeParams.search,
        sort: safeParams.sort,
      })) as unknown as T;
    }
    if (cleanPath === "/api/v1/roles/active" && method === "GET") {
      return (await RolesService.getActiveRoles()) as unknown as T;
    }
    if (cleanPath === "/api/v1/roles" && method === "POST") {
      return (await RolesService.createRole(body)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/status") &&
      cleanPath.startsWith("/api/v1/roles/") &&
      method === "PATCH"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await RolesService.changeRoleStatus(id, body.status)) as unknown as T;
    }
    if (cleanPath.startsWith("/api/v1/roles/") && method === "PUT") {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 1];
      return (await RolesService.updateRole(id, body)) as unknown as T;
    }

    // Títulos
    if (cleanPath === "/api/v1/titles" && method === "GET") {
      return (await TitlesService.getTitles({
        page: Number(safeParams.page) || 1,
        size: safeParams.size ? Number(safeParams.size) : undefined,
        statuses: safeParams.statuses,
        sellerCode: safeParams.sellerCode,
        dueDateStart: safeParams.dueDateStart,
        dueDateEnd: safeParams.dueDateEnd,
        search: safeParams.search,
        sort: safeParams.sort,
      })) as unknown as T;
    }
    if (cleanPath === "/api/v1/titles" && method === "POST") {
      return (await TitlesService.createTitle(body)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/history") &&
      cleanPath.startsWith("/api/v1/titles/") &&
      method === "GET"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await TitlesService.getTitleHistory(id)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/renegotiation-tree") &&
      cleanPath.startsWith("/api/v1/titles/") &&
      method === "GET"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await TitlesService.getRenegotiationTree(id)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/payment") &&
      cleanPath.startsWith("/api/v1/titles/") &&
      method === "POST"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await TitlesService.registerPayment(
        id,
        body.paymentMethod,
        body.paidAt,
      )) as unknown as T;
    }
    if (
      cleanPath.endsWith("/cancel") &&
      cleanPath.startsWith("/api/v1/titles/") &&
      method === "POST"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await TitlesService.cancelTitle(id)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/renegotiate") &&
      cleanPath.startsWith("/api/v1/titles/") &&
      method === "POST"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await TitlesService.renegotiateTitle(
        id,
        body.installments,
        body.reason || "",
      )) as unknown as T;
    }
    if (cleanPath.startsWith("/api/v1/titles/") && method === "GET") {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 1];
      return (await TitlesService.getTitleById(id)) as unknown as T;
    }
    if (cleanPath.startsWith("/api/v1/titles/") && method === "PUT") {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 1];
      return (await TitlesService.updateTitle(id, body)) as unknown as T;
    }

    // Usuários
    if (cleanPath === "/api/v1/users" && method === "GET") {
      return (await UsersService.getUsers({
        page: Number(safeParams.page) || 1,
        size: safeParams.size ? Number(safeParams.size) : undefined,
        search: safeParams.search,
        sort: safeParams.sort,
      })) as unknown as T;
    }
    if (cleanPath === "/api/v1/users/invite" && method === "POST") {
      return (await UsersService.inviteUser(body)) as unknown as T;
    }
    if (cleanPath === "/api/v1/users/role" && method === "POST") {
      return (await UsersService.changeUserRole(body)) as unknown as T;
    }
    if (cleanPath === "/api/v1/users/role-history" && method === "GET") {
      return (await UsersService.getRoleHistory({
        page: Number(safeParams.page) || 1,
        size: safeParams.size ? Number(safeParams.size) : undefined,
      })) as unknown as T;
    }
    if (
      cleanPath.endsWith("/status") &&
      cleanPath.startsWith("/api/v1/users/") &&
      method === "PATCH"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await UsersService.changeUserStatus(id, body.status)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/resend-invite") &&
      cleanPath.startsWith("/api/v1/users/") &&
      method === "POST"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await UsersService.resendInvitation(id)) as unknown as T;
    }
    if (
      cleanPath.endsWith("/cancel-invite") &&
      cleanPath.startsWith("/api/v1/users/") &&
      method === "POST"
    ) {
      const parts = cleanPath.split("/");
      const id = parts[parts.length - 2];
      return (await UsersService.cancelInvitation(id)) as unknown as T;
    }

    console.warn(`[MockAdapter] Nenhuma rota de mock tratada para ${method} ${path}`);
    return {} as T;
  },
};
