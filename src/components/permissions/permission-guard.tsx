"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/lib/constants/permissions";

type PermissionGuardProps = {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
