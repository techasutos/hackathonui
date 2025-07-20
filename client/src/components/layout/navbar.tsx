import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, Coins } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccessibleSheet } from "@/components/ui/accessible-sheet";
import Sidebar from "@/components/layout/sidebar";
import { LoginModal } from "@/components/auth/login-modal";
import { AvatarDropdown } from "@/components/ui/avatar-dropdown";

export function Navbar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              {t("nav.home") === "Home" ? "Digital Saving Group" : t("nav.home")}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Dropdown */}
            <Select value={language} onValueChange={(val) => setLanguage(val)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "en", label: "English" },
                  { value: "hi", label: "हिन्दी" },
                  { value: "kn", label: "ಕನ್ನಡ" },
                  { value: "or", label: "ଓଡ଼ିଆ" },
                  { value: "de", label: "Deutsch" },
                ].map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {isAuthenticated && user ? (
              <AvatarDropdown user={user} onLogout={logout} />
            ) : (
              <Button variant="outline" onClick={() => setShowLoginModal(true)}>
                {t("nav.login")}
              </Button>
            )}

            <AccessibleSheet
              title={t("nav.menu")}
              description={t("nav.sidebarDescription")}
              open={showSidebar}
              onOpenChange={setShowSidebar}
              side="right"
              trigger={
                <Button size="icon" variant="outline">
                  <Menu className="h-4 w-4" />
                </Button>
              }
            >
              <Sidebar
                isAuthenticated={isAuthenticated}
                user={user}
                onClose={() => setShowSidebar(false)}
                onLogin={() => {
                  setShowLoginModal(true);
                  setShowSidebar(false);
                }}
                onLogout={logout}
              />
            </AccessibleSheet>
          </div>
        </div>
      </nav>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
}