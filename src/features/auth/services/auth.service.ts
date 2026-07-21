import { db } from "@/mocks/data/db";
import { User, UserStatus } from "@/types";

export class AuthService {
  static async getCurrentUser(): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return db.currentUser;
  }

  static async switchCurrentUserRole(roleId: string): Promise<User> {
    const role = db.roles.find((r) => r.id === roleId);
    if (!role) throw new Error("Role not found");
    db.currentUser = {
      ...db.currentUser,
      role,
    };
    return db.currentUser;
  }

  static async login(email: string, password?: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Find matching user
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error("Credenciais inválidas. Verifique seu e-mail e senha.");
    }

    if (user.status === "PENDING_INVITATION") {
      throw new Error(
        "STATUS_PENDING: Sua conta possui um convite pendente. Verifique seu e-mail para ativar a conta ou solicite o reenvio.",
      );
    }

    if (user.status === "INACTIVE") {
      throw new Error("Sua conta está inativa. Entre em contato com o administrador.");
    }

    // Log in
    user.lastLoginAt = new Date().toISOString();
    db.currentUser = user;
    return user;
  }

  static async activateAccount(token: string, name: string, password?: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (token === "expirado") {
      throw new Error("Token de ativação expirado. Solicite um novo convite.");
    }
    if (token !== "valido") {
      throw new Error("Token de ativação inválido.");
    }

    // Find the pending user
    const user = db.users.find((u) => u.status === "PENDING_INVITATION");
    if (!user) {
      throw new Error("Nenhum convite pendente encontrado para ativação.");
    }

    user.name = name;
    user.status = "ACTIVE";
    user.lastLoginAt = new Date().toISOString();

    // Create audit log for default role assignment
    db.roleHistory.unshift({
      id: Math.random().toString(36).substring(2, 11),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      fromRoleName: "Nenhum",
      toRoleName: user.role.name,
      type: "PERMANENT",
      reason: "Ativação da conta pelo convite",
      createdAt: new Date().toISOString(),
    });

    db.currentUser = user;
    return user;
  }

  static async forgotPassword(email: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    // Safe response: return true even if user doesn't exist for security
    return true;
  }
}
