import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/hooks/use-i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { PiggyBank, FileText, Clock, TrendingUp, Plus, Download } from 'lucide-react';
import { Link } from 'wouter';

export default function MemberDashboard() {
  const { t } = useI18n();

  const { data: savingDeposits, isLoading: savingsLoading } = useQuery({
    queryKey: ['/api/saving-deposits'],
    queryFn: () => api.getSavingDeposits(),
  });

  const { data: loanApplications, isLoading: loansLoading } = useQuery({
    queryKey: ['/api/loan-applications'],
    queryFn: () => api.getLoanApplications(),
  });

  // Calculate totals
  const totalSavings = savingDeposits?.reduce((sum: number, deposit: any) => sum + parseFloat(deposit.amount), 0) || 0;
  const activeLoans = loanApplications?.filter((loan: any) => loan.status === 'DISBURSED') || [];
  const pendingInstallments = activeLoans.reduce((sum: number, loan: any) => sum + (parseFloat(loan.amount) * 0.1), 0);

  const stats = [
    {
      title: t('dashboard.totalSavings'),
      value: `₹${totalSavings.toLocaleString()}`,
      icon: PiggyBank,
      color: 'from-emerald-400 to-emerald-600',
      change: '+₹500 this month'
    },
    {
      title: t('dashboard.activeLoan'),
      value: activeLoans.length > 0 ? `₹${parseFloat(activeLoans[0]?.amount || 0).toLocaleString()}` : 'No active loan',
      icon: FileText,
      color: 'from-blue-400 to-blue-600',
      change: activeLoans.length > 0 ? t('dashboard.dueDate') : 'Apply for a loan'
    },
    {
      title: t('dashboard.remainingInstallments'),
      value: activeLoans.length,
      icon: Clock,
      color: 'from-amber-400 to-amber-600',
      change: `₹${pendingInstallments.toLocaleString()} pending`
    },
    {
      title: t('dashboard.repaymentScore'),
      value: '95%',
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600',
      change: t('dashboard.excellent')
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('dashboard.member.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.member.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Link href="/savings">
          <Button className="gradient-bg">
            <Plus className="w-4 h-4 mr-2" />
            New Deposit
          </Button>
        </Link>
        <Link href="/loans/apply">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Apply for Loan
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Deposits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('dashboard.recentDeposits')}</CardTitle>
            <Button variant="ghost" size="sm">
              {t('dashboard.viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            {savingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : savingDeposits?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PiggyBank className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No deposits found</p>
                <p className="text-sm">Start saving by making your first deposit</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savingDeposits?.slice(0, 3).map((deposit: any) => (
                  <div key={deposit.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{deposit.remarks || 'Savings Deposit'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(deposit.depositDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-600 font-semibold">+₹{parseFloat(deposit.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.upcomingPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activeLoans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming payments</p>
                <p className="text-sm">You have no active loans</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLoans.slice(0, 2).map((loan: any) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400">
                    <div>
                      <p className="font-medium">Loan #{loan.id}</p>
                      <p className="text-sm text-muted-foreground">Due: Next month</p>
                    </div>
                    <span className="text-amber-600 font-semibold">
                      ₹{(parseFloat(loan.amount) * 0.1).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
