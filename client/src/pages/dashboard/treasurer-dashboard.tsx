import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, PiggyBank, FileText, Clock, DollarSign } from 'lucide-react';

export default function TreasurerDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingLoans, isLoading: loansLoading } = useQuery({
    queryKey: ['/api/loan-applications', 'PENDING'],
    queryFn: () => api.getLoanApplications(undefined, undefined, 'PENDING'),
  });

  const { data: approvedLoans, isLoading: approvedLoading } = useQuery({
    queryKey: ['/api/loan-applications', 'APPROVED'],
    queryFn: () => api.getLoanApplications(undefined, undefined, 'APPROVED'),
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['/api/groups'],
    queryFn: () => api.getGroups(),
  });

  const approveLoanMutation = useMutation({
    mutationFn: (loanId: number) => api.approveLoanApplication(loanId, user?.id || 1),
    onSuccess: () => {
      toast({
        title: "Loan Approved",
        description: "The loan application has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loan-applications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve loan application.",
        variant: "destructive",
      });
    },
  });

  const disburseLoanMutation = useMutation({
    mutationFn: (loanId: number) => api.disburseLoan(loanId, user?.id || 1),
    onSuccess: () => {
      toast({
        title: "Loan Disbursed",
        description: "The loan amount has been disbursed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loan-applications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disburse loan.",
        variant: "destructive",
      });
    },
  });

  const totalFunds = groups?.reduce((sum: number, group: any) => sum + parseFloat(group.totalBalance || 0), 0) || 0;
  const pendingAmount = pendingLoans?.reduce((sum: number, loan: any) => sum + parseFloat(loan.amount), 0) || 0;
  const approvedAmount = approvedLoans?.reduce((sum: number, loan: any) => sum + parseFloat(loan.amount), 0) || 0;

  const stats = [
    {
      title: 'Available Funds',
      value: `₹${totalFunds.toLocaleString()}`,
      icon: PiggyBank,
      color: 'from-emerald-400 to-emerald-600'
    },
    {
      title: 'Pending Approvals',
      value: pendingLoans?.length || 0,
      icon: Clock,
      color: 'from-amber-400 to-amber-600'
    },
    {
      title: 'Ready to Disburse',
      value: approvedLoans?.length || 0,
      icon: CheckCircle,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Pending Amount',
      value: `₹${pendingAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('dashboard.treasurer.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.treasurer.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Approve Loans</h3>
            <p className="text-muted-foreground text-sm mb-4">Review and approve loan applications</p>
            <Button className="w-full">Review Now</Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Reject Loans</h3>
            <p className="text-muted-foreground text-sm mb-4">Reject unsuitable applications</p>
            <Button variant="destructive" className="w-full">Manage Rejections</Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-secondary-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Disburse Funds</h3>
            <p className="text-muted-foreground text-sm mb-4">Release approved loan funds</p>
            <Button variant="secondary" className="w-full">Disburse Now</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Loan Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Loan Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pendingLoans?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending applications</p>
                <p className="text-sm">All loan applications are processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLoans?.map((loan: any) => (
                  <div key={loan.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Loan #{loan.id}</h4>
                        <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{parseFloat(loan.amount).toLocaleString()}</p>
                        <Badge variant="secondary">{loan.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveLoanMutation.mutate(loan.id)}
                        disabled={approveLoanMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ready for Disbursement */}
        <Card>
          <CardHeader>
            <CardTitle>Ready for Disbursement</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : approvedLoans?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No approved loans</p>
                <p className="text-sm">Approved loans will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedLoans?.map((loan: any) => (
                  <div key={loan.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Loan #{loan.id}</h4>
                        <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{parseFloat(loan.amount).toLocaleString()}</p>
                        <Badge className="bg-green-100 text-green-800">APPROVED</Badge>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => disburseLoanMutation.mutate(loan.id)}
                      disabled={disburseLoanMutation.isPending}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Disburse Amount
                    </Button>
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
