import { db } from "@/mocks/data/db";
import { User, RoleHistory, PageResponse, UserStatus } from "@/types";

export class UsersService {
  static async getUsers(params: {
    page: number;
    size?: number;
    search?: string;
    sort?: string;
  }): Promise<PageResponse<User>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const size = params.size || 15;
    const page = params.page || 1;
    const search = (params.search || "").toLowerCase().trim();

    let items = db.users;
    if (search) {
      items = items.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.role.name.toLowerCase().includes(search),
      );
    }

    if (params.sort) {
      const [field, direction] = params.sort.split(",");
      items = [...items].sort((a: any, b: any) => {
        let valA = field === "role" ? a.role.name : a[field];
        let valB = field === "role" ? b.role.name : b[field];
        valA = valA || "";
        valB = valB || "";
        if (typeof valA === "string") {
          return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return direction === "asc" ? valA - valB : valB - valA;
        }
      });
    }

    const totalElements = items.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = (page - 1) * size;
    const content = items.slice(start, start + size);

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
    };
  }

  static async inviteUser(data: { name: string; email: string; roleId: string }): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Check email uniqueness
    const exists = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      throw new Error(`O e-mail "${data.email}" já está cadastrado no sistema.`);
    }

    const role = db.roles.find((r) => r.id === data.roleId);
    if (!role) throw new Error("Cargo não encontrado");

    // Hierarchy block: current user can only invite users below their level
    if (
      db.currentUser.role.hierarchyLevel >= role.hierarchyLevel &&
      db.currentUser.role.name !== "Owner"
    ) {
      throw new Error(
        "Você não possui permissões hierárquicas para convidar um usuário para este cargo.",
      );
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      name: data.name,
      email: data.email,
      role,
      status: "PENDING_INVITATION",
      createdAt: new Date().toISOString(),
    };

    db.users.unshift(newUser);
    return newUser;
  }

  static async resendInvitation(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const user = db.users.find((u) => u.id === id);
    if (!user) throw new Error("Usuário não encontrado");
    if (user.status !== "PENDING_INVITATION")
      throw new Error("Convite já foi aceito ou inativado.");
    return true;
  }

  static async cancelInvitation(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("Usuário não encontrado");
    const user = db.users[index];
    if (user.status !== "PENDING_INVITATION")
      throw new Error("Apenas convites pendentes podem ser cancelados.");
    db.users.splice(index, 1);
    return true;
  }

  static async changeUserRole(params: {
    userId: string;
    roleId: string;
    type: "PERMANENT" | "TEMPORARY";
    reason: string;
    startDate?: string;
    endDate?: string;
  }): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const user = db.users.find((u) => u.id === params.userId);
    if (!user) throw new Error("Usuário não encontrado");

    const role = db.roles.find((r) => r.id === params.roleId);
    if (!role) throw new Error("Cargo não encontrado");

    // Check hierarchy level of current user
    const curLevel = db.currentUser.role.hierarchyLevel;

    // 1. Current user must be ABOVE the user being edited (numerically lower) OR be the Owner
    if (db.currentUser.role.name !== "Owner" && curLevel >= user.role.hierarchyLevel) {
      throw new Error(
        `Permissão negada. Você está no nível ${curLevel} e o usuário destino no nível ${user.role.hierarchyLevel}. Você só pode editar usuários em nível abaixo do seu.`,
      );
    }

    // 2. Current user must also be ABOVE the role being assigned OR be the Owner
    if (db.currentUser.role.name !== "Owner" && curLevel >= role.hierarchyLevel) {
      throw new Error(
        `Permissão negada. Você só pode promover usuários para cargos hierarquicamente inferiores ao seu.`,
      );
    }

    // 3. Manager promotion check: promoting to Level 2 (Gerente) or Level 1 (Owner) requires OWNER approval
    if (role.hierarchyLevel <= 2 && db.currentUser.role.name !== "Owner") {
      throw new Error(
        "A promoção para cargos de gestão (Gerente/Owner) exige privilégios explícitos de Owner. Operação bloqueada.",
      );
    }

    // Validate reason length (10 to 100 characters)
    const reason = params.reason.trim();
    if (reason.length < 10 || reason.length > 100) {
      throw new Error("O motivo da alteração deve ter entre 10 e 100 caracteres.");
    }

    // Validate dates for temporary promotions
    if (params.type === "TEMPORARY") {
      if (!params.startDate || !params.endDate) {
        throw new Error("Para atribuições temporárias, as datas de início e fim são obrigatórias.");
      }
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      if (end.getTime() <= start.getTime()) {
        throw new Error("A data final deve ser estritamente maior que a data inicial.");
      }
    }

    const previousRoleName = user.role.name;
    user.role = role;

    // Log the change in history
    db.roleHistory.unshift({
      id: Math.random().toString(36).substring(2, 11),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      fromRoleName: previousRoleName,
      toRoleName: role.name,
      type: params.type,
      reason,
      startDate: params.startDate,
      endDate: params.endDate,
      createdAt: new Date().toISOString(),
    });

    return user;
  }

  static async getRoleHistory(params: {
    page: number;
    size?: number;
  }): Promise<PageResponse<RoleHistory>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const size = params.size || 15;
    const page = params.page || 1;

    const items = db.roleHistory;
    const totalElements = items.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = (page - 1) * size;
    const content = items.slice(start, start + size);

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
    };
  }

  static async changeUserStatus(id: string, status: UserStatus): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const user = db.users.find((u) => u.id === id);
    if (!user) throw new Error("Usuário não encontrado");

    // Check hierarchy: only Owner or higher hierarchy can toggle status
    if (
      db.currentUser.role.name !== "Owner" &&
      db.currentUser.role.hierarchyLevel >= user.role.hierarchyLevel
    ) {
      throw new Error("Permissão negada. Nível hierárquico insuficiente.");
    }

    user.status = status;
    return user;
  }
}
