import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MainFrame from "@/components/layout/MainFrame";
import {
  Coins,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface DashboardStats {
  totalMembers: number;
  totalGroups: number;
  totalSavings: number;
  pendingLoanRequests: number;
  activeLoans: number;
  totalLoanAmount: number;
}

function MemberDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Mock member data - in real app this would come from API
  const memberStats = {
    totalSavings: 25000,
    activeLoan: 15000,
    remainingInstallments: 8,
    nextDueDate: "2024-03-15",
    repaymentScore: 95
  };

  const recentDeposits = [
    { id: 1, amount: 1000, date: "2024-02-15", type: "Monthly Savings" },
    { id: 2, amount: 500, date: "2024-02-10", type: "Bonus Deposit" },
    { id: 3, amount: 1000, date: "2024-01-15", type: "Regular Deposit" }
  ];

  const upcomingPayments = [
    { id: 1, amount: 2000, dueDate: "2024-03-15", type: "Loan Installment" },
    { id: 2, amount: 500, dueDate: "2024-03-20", type: "Monthly Savings" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.member.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.member.subtitle')}</p>
      </div>

      {/* Member Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">₹{memberStats.totalSavings.toLocaleString()}</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.totalSavings')}</h3>
            <p className="text-xs text-green-600 mt-1">+₹500 this month</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">₹{memberStats.activeLoan.toLocaleString()}</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.activeLoan')}</h3>
            <p className="text-xs text-blue-600 mt-1">{t('dashboard.dueDate')}</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{memberStats.remainingInstallments}</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.remainingInstallments')}</h3>
            <p className="text-xs text-amber-600 mt-1">₹2,000 per month</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{memberStats.repaymentScore}%</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.repaymentScore')}</h3>
            <p className="text-xs text-green-600 mt-1">{t('dashboard.excellent')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentDeposits')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeposits.map((deposit) => (
                <div key={deposit.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{deposit.type}</div>
                    <div className="text-sm text-muted-foreground">{deposit.date}</div>
                  </div>
                  <div className="text-green-600 font-semibold">+₹{deposit.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.upcomingPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400">
                  <div>
                    <div className="font-medium">{payment.type}</div>
                    <div className="text-sm text-muted-foreground">Due: {payment.dueDate}</div>
                  </div>
                  <div className="text-amber-600 font-semibold">₹{payment.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { t } = useLanguage();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
    queryFn: () => apiService.getDashboardAnalytics()
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.admin.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.admin.subtitle')}</p>
      </div>

      {/* Admin Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">₹{analytics?.totalSavings?.toLocaleString() || '0'}</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.totalGroupFund')}</h3>
            <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{analytics?.pendingLoanRequests || 0}</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.pendingLoanRequests')}</h3>
            <p className="text-xs text-blue-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{analytics?.totalMembers || 0}</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.activeMembers')}</h3>
            <p className="text-xs text-green-600 mt-1">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">15/17</span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.sdgImpact')}</h3>
            <p className="text-xs text-green-600 mt-1">{t('dashboard.excellent')} Coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.loanTrends')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">{t('dashboard.chartPlaceholder')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.groupGrowth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">{t('dashboard.chartPlaceholder')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();

  return (
  <MainFrame>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {hasRole('ADMIN') ? <AdminDashboard /> : <MemberDashboard />}
      </div>
    </div>
  </MainFrame>
  );
}
