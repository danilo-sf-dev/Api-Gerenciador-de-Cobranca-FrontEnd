import { useAuth } from "@/features/auth/context/auth-context";
import { Permission } from "@/lib/constants/permissions";

export function usePermissions() {
  const { user, hasPermission } = useAuth();

  return {
    user,
    hasPermission,
    isOwner: user?.role.name === "Owner",
    isGerente: user?.role.name === "Gerente",
    isVendedor: user?.role.name === "Vendedor",
    isFuncionario: user?.role.name === "Funcionário",
    hierarchyLevel: user?.role.hierarchyLevel ?? 4,
  };
}
