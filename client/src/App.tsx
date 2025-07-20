import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { LanguageProvider } from "@/components/ui/language-provider";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import LoanApplication from "@/pages/loan-application";
import MemberManagement from "@/pages/member-management";
import GroupManagement from "@/pages/group-management";
import RoleManagement from "@/pages/role-management";
import SDGImpact from "@/pages/sdg-impact";
import LoanApprovals from "@/pages/loan-approvals";
import Savings from "@/pages/savings";
import { I18nProvider } from '@/hooks/use-i18n';
import CreatePollPage from "@/pages/polls/create-poll";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/loan-application" component={LoanApplication} />
      <Route path="/member-management" component={MemberManagement} />
      <Route path="/group-management" component={GroupManagement} />
      <Route path="/role-management" component={RoleManagement} />
	  <Route path="/sdg-impact" component={SDGImpact} />
      <Route path="/loan-approvals" component={LoanApprovals} />
      <Route path="/savings" component={Savings} />
	  
	 <Route path="/polls/create" component={CreatePollPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
	   <I18nProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
		</I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
