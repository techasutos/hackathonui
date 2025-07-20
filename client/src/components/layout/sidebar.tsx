import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import {
  LayoutDashboard,
  PiggyBank,
  FileText,
  Users,
  Building2,
  Shield,
  BarChart3,
  Target,
  CheckCircle,
  UserCheck,
  Settings,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
  permissions?: string[];
}

function SidebarLink({ href, icon, label, roles, permissions }: SidebarLinkProps) {
  const [location] = useLocation();
  const { hasRole, hasPermission } = useAuth();
  const isActive = location === href;

  if (roles && !roles.some((r) => hasRole(r))) return null;
  if (permissions && !permissions.some((p) => hasPermission(p))) return null;

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar({
  isAuthenticated,
  user,
  onClose,
  onLogin,
  onLogout,
}: {
  isAuthenticated: boolean;
  user: any;
  onClose: () => void;
  onLogin: () => void;
  onLogout: () => void;
}) {
  const { t, language } = useI18n(); // triggers re-render on change

  const sidebarLinks: SidebarLinkProps[] = [
    { href: "/dashboard/", icon: <LayoutDashboard className="h-4 w-4" />, label: t("nav.dashboard") },
    { href: "/savings", icon: <PiggyBank className="h-4 w-4" />, label: t("nav.savings") },
    { href: "/loan-application", icon: <FileText className="h-4 w-4" />, label: t("nav.applyLoan"), roles: ["TREASURER", "MEMBER", "PRESIDENT"] },
    { href: "/loan-approvals", icon: <CheckCircle className="h-4 w-4" />, label: t("nav.loanApprovals"), roles: ["TREASURER", "ADMIN", "PRESIDENT"] },
    { href: "/management/members", icon: <UserCheck className="h-4 w-4" />, label: t("nav.memberManagement"), roles: ["ADMIN"] },
    { href: "/management/groups", icon: <Building2 className="h-4 w-4" />, label: t("nav.groupManagement"), roles: ["ADMIN", "PRESIDENT"] },
    { href: "/management/roles", icon: <Shield className="h-4 w-4" />, label: t("nav.roleManagement"), roles: ["ADMIN"] },
    { href: "/sdg-dashboard", icon: <Target className="h-4 w-4" />, label: t("nav.sdgImpact") },
    { href: "/dashboard/admin", icon: <BarChart3 className="h-4 w-4" />, label: t("dashboard.admin.title"), roles: ["ADMIN"] },
    { href: "/dashboard/treasurer", icon: <Settings className="h-4 w-4" />, label: t("dashboard.treasurer.title"), roles: ["TREASURER"] },
    { href: "/polls/create", icon: <PlusCircle className="h-4 w-4" />, label: t("nav.createPoll"), roles: ["ADMIN", "PRESIDENT"] },
  ];

  return (
    <aside key={language} className="w-full h-full bg-background p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "User"}</p>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={onLogin}>
            {t("nav.login")}
          </Button>
        )}
        {isAuthenticated && (
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link, idx) => (
          <SidebarLink key={idx} {...link} />
        ))}
      </nav>
    </aside>
  );
}