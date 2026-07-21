"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/types";
import { AuthService } from "../services/auth.service";
import { Permission } from "@/lib/constants/permissions";
import { hasPermission as checkPermission } from "@/lib/permissions/can";
import { db } from "@/mocks/data/db";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<User>;
  logout: () => void;
  changeRole: (roleId: string) => Promise<User>;
  hasPermission: (permission: Permission) => boolean;
  roles: Role[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        setRoles(db.roles);
      } catch (err) {
        console.error("Failed to initialize auth", err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const loggedUser = await AuthService.login(email);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    window.location.href = "/login";
  };

  const changeRole = async (roleId: string) => {
    const updatedUser = await AuthService.switchCurrentUserRole(roleId);
    setUser({ ...updatedUser });
    return updatedUser;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return checkPermission(user.role.name, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        changeRole,
        hasPermission,
        roles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
