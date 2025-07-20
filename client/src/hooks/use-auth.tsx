import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { User, LoginRequest } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

interface DecodedToken {
  sub: string;
  userId: number;
  roles: string[];
  permissions?: string[];
  groupId?: number; // ✅ Make sure backend includes this in JWT
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: { username: string; password: string; email?: string }) => Promise<User>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  canAccess: (requiredRoles: string[]) => boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const storedUser = localStorage.getItem("user");

        const userFromToken: User = {
          id: decoded.userId,
          username: decoded.sub,
          roles: decoded.roles,
          permissions: decoded.permissions || [],
          groupId: decoded.groupId ?? null,
        };

        const mergedUser = storedUser
          ? { ...userFromToken, ...JSON.parse(storedUser) }
          : userFromToken;

        setUser(mergedUser);
      } catch (e) {
        console.error("Token decode failed", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async ({ username, password }: LoginRequest): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error((await res.json()).message || "Login failed");

    const data = await res.json();
    const decoded = jwtDecode<DecodedToken>(data.token);

    const user: User = {
      id: decoded.userId,
      username: decoded.sub,
      roles: decoded.roles,
      permissions: decoded.permissions || [],
      email: data.user?.email ?? "",
      phone: data.user?.phone ?? "",
      name: data.user?.name ?? "",
      groupId: data.user?.groupId ?? null,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const register = async (userData: { username: string; password: string; email?: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error((await res.json()).message || "Registration failed");
    return (await res.json()).user;
  };

  const hasRole = (role: string) => user?.roles?.includes(role) || false;
  const hasAnyRole = (roles: string[]) => roles.some(r => hasRole(r));
  const hasPermission = (perm: string) => user?.permissions?.includes(perm) || false;
  const hasAnyPermission = (perms: string[]) => perms.some(p => hasPermission(p));
  const canAccess = (requiredRoles: string[]) => hasAnyRole(requiredRoles);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, hasRole, hasAnyRole, hasPermission, hasAnyPermission, canAccess, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};