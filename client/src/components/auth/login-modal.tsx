import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function LoginModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const demoCredentials = [
    { role: "Admin", username: "admin", password: "admin123" },
    { role: "Member", username: "priya", password: "priya123" },
    { role: "Treasurer", username: "meera", password: "meera123" },
    { role: "President", username: "sita", password: "sita123" },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
      toast({ title: t("login.success"), description: t("login.welcome") });
      setLocation("/dashboard/");
      onOpenChange(false);
    } catch {
      toast({
        title: t("login.failed"),
        description: t("login.invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost">{t("nav.login")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="login-modal-desc">
        <DialogHeader>
          <DialogTitle>{t("login.title")}</DialogTitle>
          <VisuallyHidden>
            <DialogDescription id="login-modal-desc">
              {t("login.description", "Please sign in to your account.")}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("login.username")}</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("login.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(c) => handleInputChange("rememberMe", !!c)}
              />
              <Label htmlFor="remember">{t("login.remember")}</Label>
            </div>
            <Button variant="link" className="px-0 font-normal">
              {t("login.forgot")}
            </Button>
          </div>

          <Button className="w-full h-11 gradient-bg" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("login.signingIn")}
              </>
            ) : (
              t("login.signIn")
            )}
          </Button>

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground mb-3">
              {t("login.demoText")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.map((cred) => (
                <Button
                  key={cred.role}
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange("username", cred.username) || handleInputChange("password", cred.password)}
                >
                  {cred.role}
                </Button>
              ))}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}