import { LoginRequest } from "@shared/schema";
import { apiRequest } from "./queryClient";
import jwtDecode from "jwt-decode";

export interface User {
  id: number;
  username: string;
  email?: string;
  roles: string[];
  permissions?: string[];
  groupId?: number | null;
  name?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface DecodedToken {
  sub: string;
  userId: number;
  roles: string[];
  permissions?: string[];
  exp: number;
  email?: string;
  name?: string;
  groupId?: number;
  phone?: string;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.authState));
  }

  getState(): AuthState {
    return this.authState;
  }

  private decodeToken(token: string): User {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.userId,
      username: decoded.sub,
      roles: decoded.roles,
      permissions: decoded.permissions ?? [],
      email: decoded.email,
      groupId: decoded.groupId ?? null,
      name: decoded.name,
      phone: decoded.phone,
    };
  }

  async login(credentials: LoginRequest): Promise<User> {
    this.authState.isLoading = true;
    this.notify();

    try {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const { token } = response.data;

      const user = this.decodeToken(token);

      this.authState = {
        user,
        isAuthenticated: true,
        isLoading: false,
      };

      localStorage.setItem("token", token);
      this.notify();
      return user;
    } catch (error) {
      this.authState.isLoading = false;
      this.notify();
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };

    localStorage.removeItem("token");
    this.notify();
  }

  async register(userData: { username: string; password: string; email?: string }): Promise<User> {
    this.authState.isLoading = true;
    this.notify();

    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const { token } = response.data;

      const user = this.decodeToken(token);

      this.authState = {
        user,
        isAuthenticated: true,
        isLoading: false,
      };

      localStorage.setItem("token", token);
      this.notify();
      return user;
    } catch (error) {
      this.authState.isLoading = false;
      this.notify();
      throw error;
    }
  }

  initializeAuth(): void {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        this.logout(); // Auto logout if expired
        return;
      }

      const user = this.decodeToken(token);

      this.authState = {
        user,
        isAuthenticated: true,
        isLoading: false,
      };
      this.notify();
    } catch (err) {
      localStorage.removeItem("token");
    }
  }

  hasRole(role: string): boolean {
    return this.authState.user?.roles?.includes(role) || false;
  }

  hasPermission(permission: string): boolean {
    return this.authState.user?.permissions?.includes(permission) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  canAccess(requiredRoles: string[]): boolean {
    if (!this.authState.isAuthenticated) return false;
    if (this.hasRole("ADMIN")) return true;
    return this.hasAnyRole(requiredRoles);
  }
}

export const authService = AuthService.getInstance();