import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { APIService } from "@/lib/api";
import type { User, Member } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  member: Member | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user");
    const savedMember = localStorage.getItem("member");
    const savedRole = localStorage.getItem("role");
    
    if (savedUser && savedMember && savedRole) {
      setUser(JSON.parse(savedUser));
      setMember(JSON.parse(savedMember));
      setRole(savedRole);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await APIService.login(username, password);
      
      setUser(response.user);
      setMember(response.member);
      setRole(response.role);
      
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("member", JSON.stringify(response.member));
      localStorage.setItem("role", response.role);
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setMember(null);
    setRole(null);
    
    localStorage.removeItem("user");
    localStorage.removeItem("member");
    localStorage.removeItem("role");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        role,
        isAuthenticated,
        login,
        logout,
        isLoading,
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
