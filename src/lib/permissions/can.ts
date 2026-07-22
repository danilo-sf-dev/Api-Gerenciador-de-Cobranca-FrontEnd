import { Permission, PERMISSIONS } from "@/lib/constants/permissions";

export type UserRole = "Owner" | "Gerente" | "Vendedor" | "Funcionário" | string;

// Standard role permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  Owner: Object.values(PERMISSIONS),
  Gerente: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SELLERS,
    PERMISSIONS.CREATE_SELLER,
    PERMISSIONS.EDIT_SELLER,
    PERMISSIONS.INACTIVATE_SELLER,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.INVITE_USER,
    PERMISSIONS.RESEND_INVITATION,
    PERMISSIONS.CANCEL_INVITATION,
    PERMISSIONS.CHANGE_USER_ROLE,
    PERMISSIONS.TOGGLE_USER_STATUS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.VIEW_TITLES,
    PERMISSIONS.CREATE_TITLE,
    PERMISSIONS.EDIT_TITLE,
    PERMISSIONS.CANCEL_TITLE,
    PERMISSIONS.REGISTER_PAYMENT,
    PERMISSIONS.RENEGOTIATE_TITLE,
    PERMISSIONS.IMPORT_TITLES,
  ],
  Vendedor: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SELLERS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.VIEW_TITLES,
    PERMISSIONS.CREATE_TITLE,
    PERMISSIONS.EDIT_TITLE,
    PERMISSIONS.REGISTER_PAYMENT,
    PERMISSIONS.RENEGOTIATE_TITLE,
    PERMISSIONS.IMPORT_TITLES,
  ],
  Funcionário: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SELLERS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_TITLES,
  ],
};

/**
 * Checks if a user role has a specific permission
 */
export function hasPermission(roleName: string, permission: Permission): boolean {
  const normalizedRole = roleName.trim();
  const permissions = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS["Funcionário"];
  return permissions.includes(permission);
}

/**
 * Hierarchy check: A user can only manage/edit another user if their hierarchy level
 * is strictly higher (numerically lower) than the target user's hierarchy level.
 */
export function canManageHierarchy(currentUserLevel: number, targetUserLevel: number): boolean {
  // Level 1 is Owner, Level 2 is Gerente, etc. Lower number means higher in hierarchy.
  return currentUserLevel < targetUserLevel;
}
