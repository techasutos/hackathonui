import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/hooks/use-i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Users, PiggyBank, FileText, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { t } = useI18n();

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['/api/groups'],
    queryFn: () => api.getGroups(),
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['/api/members'],
    queryFn: () => api.getMembers(),
  });

  const { data: loanApplications, isLoading: loansLoading } = useQuery({
    queryKey: ['/api/loan-applications'],
    queryFn: () => api.getLoanApplications(),
  });

  const { data: savingDeposits, isLoading: savingsLoading } = useQuery({
    queryKey: ['/api/saving-deposits'],
    queryFn: () => api.getSavingDeposits(),
  });

  const { data: sdgImpacts, isLoading: sdgLoading } = useQuery({
    queryKey: ['/api/sdg-impacts'],
    queryFn: () => api.getSDGImpacts(),
  });

  // Calculate metrics
  const totalMembers = members?.length || 0;
  const totalGroupFund = groups?.reduce((sum: number, group: any) => sum + parseFloat(group.totalBalance || 0), 0) || 0;
  const pendingLoans = loanApplications?.filter((loan: any) => loan.status === 'PENDING')?.length || 0;
  const totalSavings = savingDeposits?.reduce((sum: number, deposit: any) => sum + parseFloat(deposit.amount), 0) || 0;
  const sdgGoalsImpacted = new Set(sdgImpacts?.map((impact: any) => impact.sdgGoal))?.size || 0;

  const stats = [
    {
      title: t('dashboard.totalGroupFund'),
      value: `₹${totalGroupFund.toLocaleString()}`,
      icon: PiggyBank,
      color: 'from-emerald-400 to-emerald-600',
      change: '+8.2% from last month'
    },
    {
      title: t('dashboard.pendingLoanRequests'),
      value: pendingLoans,
      icon: FileText,
      color: 'from-amber-400 to-amber-600',
      change: 'Requires attention',
      urgent: pendingLoans > 0
    },
    {
      title: t('dashboard.activeMembers'),
      value: totalMembers.toLocaleString(),
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      change: '+12 this week'
    },
    {
      title: t('dashboard.sdgImpact'),
      value: `${sdgGoalsImpacted}/17`,
      icon: Target,
      color: 'from-purple-400 to-purple-600',
      change: t('dashboard.excellent')
    }
  ];

  const quickActions = [
    {
      title: 'Review Loan Applications',
      description: `${pendingLoans} applications pending`,
      href: '/loans/approvals',
      icon: FileText,
      urgent: pendingLoans > 0
    },
    {
      title: 'Manage Members',
      description: 'Add or approve new members',
      href: '/management/members',
      icon: Users
    },
    {
      title: 'Group Management',
      description: 'Manage SHG groups',
      href: '/management/groups',
      icon: Target
    },
    {
      title: 'SDG Impact',
      description: 'View sustainability metrics',
      href: '/sdg-dashboard',
      icon: TrendingUp
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('dashboard.admin.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.admin.subtitle')}</p>
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
                  <p className={`text-xs ${stat.urgent ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              {stat.urgent && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center mx-auto mb-4 ${action.urgent ? 'ring-2 ring-amber-400' : ''}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  {action.urgent && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Urgent
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Analytics Charts Placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.loanTrends')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('dashboard.chartPlaceholder')}</p>
                <p className="text-sm">Loan applications over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.groupGrowth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('dashboard.chartPlaceholder')}</p>
                <p className="text-sm">Member growth and group performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Loan Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : loanApplications?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No loan applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loanApplications?.slice(0, 5).map((loan: any) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Loan #{loan.id}</p>
                      <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{parseFloat(loan.amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        loan.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' :
                        loan.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Savings</CardTitle>
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
                <p>No savings deposits</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savingDeposits?.slice(0, 5).map((deposit: any) => (
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
      </div>
    </div>
  );
}
