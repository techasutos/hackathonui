import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '@shared/schema';

interface AuthUser {
  id: number;
  username: string;
  email?: string;
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    
    // Call logout endpoint
    fetch('/api/auth/logout', { method: 'POST' });
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasPermission = (permission: string): boolean => {
    // Admin has all permissions
    if (hasRole('ADMIN')) return true;
    
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      MEMBER: ['SAVINGS_DEPOSIT', 'LOAN_APPLICATION', 'VIEW_OWN_DATA'],
      TREASURER: ['LOAN_APPROVAL', 'FUND_MANAGEMENT', 'VIEW_GROUP_DATA'],
      PRESIDENT: ['GROUP_MANAGEMENT', 'MEMBER_APPROVAL', 'POLL_CREATION', 'VIEW_GROUP_DATA'],
      ADMIN: ['ALL'],
    };

    return user?.roles?.some(role => 
      rolePermissions[role]?.includes(permission) || rolePermissions[role]?.includes('ALL')
    ) ?? false;
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    hasPermission,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
