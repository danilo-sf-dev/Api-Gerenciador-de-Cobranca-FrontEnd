import { db } from "@/mocks/data/db";
import { Role, PageResponse } from "@/types";

export class RolesService {
  static async getRoles(params: {
    page: number;
    size?: number;
    search?: string;
    sort?: string;
  }): Promise<PageResponse<Role>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const size = params.size || 15;
    const page = params.page || 1;
    const search = (params.search || "").toLowerCase().trim();

    let items = db.roles;
    if (search) {
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(search) || r.hierarchyLevel.toString().includes(search),
      );
    }

    if (params.sort) {
      const [field, direction] = params.sort.split(",");
      items = [...items].sort((a: any, b: any) => {
        const valA = a[field];
        const valB = b[field];
        if (typeof valA === "string") {
          return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return direction === "asc" ? valA - valB : valB - valA;
        }
      });
    } else {
      // Default sort by hierarchyLevel ascending (lowest level number = highest privilege first)
      items = [...items].sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
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

  static async getRoleById(id: string): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const role = db.roles.find((r) => r.id === id);
    if (!role) throw new Error("Cargo não encontrado");
    return role;
  }

  static async createRole(data: Omit<Role, "id" | "createdAt" | "updatedAt">): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if role name already exists
    const exists = db.roles.find((r) => r.name.toLowerCase() === data.name.toLowerCase());
    if (exists) {
      throw new Error(`Um cargo com o nome "${data.name}" já está cadastrado.`);
    }

    const newRole: Role = {
      id: Math.random().toString(36).substring(2, 11),
      name: data.name,
      hierarchyLevel: data.hierarchyLevel,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.roles.push(newRole);
    return newRole;
  }

  static async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const role = db.roles.find((r) => r.id === id);
    if (!role) throw new Error("Cargo não encontrado");

    if (
      role.name === "Owner" ||
      role.name === "Gerente" ||
      role.name === "Vendedor" ||
      role.name === "Funcionário"
    ) {
      // Protect default system roles from name / hierarchy edits to prevent breakages,
      // but allow toggling status or editing other fields if custom.
      if (data.name && data.name !== role.name) {
        throw new Error("Não é permitido alterar o nome de cargos padrão do sistema.");
      }
      if (data.hierarchyLevel !== undefined && data.hierarchyLevel !== role.hierarchyLevel) {
        throw new Error("Não é permitido alterar o nível hierárquico de cargos padrão do sistema.");
      }
    }

    if (data.name) {
      const exists = db.roles.find(
        (r) => r.id !== id && r.name.toLowerCase() === data.name!.toLowerCase(),
      );
      if (exists) {
        throw new Error(`Um cargo com o nome "${data.name}" já está cadastrado.`);
      }
      role.name = data.name;
    }

    if (data.hierarchyLevel !== undefined) role.hierarchyLevel = data.hierarchyLevel;
    if (data.status) role.status = data.status;
    role.updatedAt = new Date().toISOString();

    return role;
  }

  static async changeRoleStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<Role> {
    return this.updateRole(id, { status });
  }

  static async getActiveRoles(): Promise<Role[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return db.roles.filter((r) => r.status === "ACTIVE");
  }
}
