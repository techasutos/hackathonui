import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Calendar, 
  DollarSign,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  DISBURSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  REPAID: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export default function LoanApprovals() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('pending');

  const { data: loanApplications, isLoading } = useQuery({
    queryKey: ['/api/loan-applications'],
    queryFn: () => api.getLoanApplications(),
  });

  const { data: members } = useQuery({
    queryKey: ['/api/members'],
    queryFn: () => api.getMembers(),
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

  const getMemberName = (memberId: number) => {
    const member = members?.find((m: any) => m.id === memberId);
    return member?.name || 'Unknown Member';
  };

  const filteredLoans = loanApplications?.filter((loan: any) => {
    const matchesSearch = getMemberName(loan.memberId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && loan.status === 'PENDING') ||
                      (activeTab === 'approved' && loan.status === 'APPROVED') ||
                      (activeTab === 'disbursed' && loan.status === 'DISBURSED');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const pendingCount = loanApplications?.filter((loan: any) => loan.status === 'PENDING').length || 0;
  const approvedCount = loanApplications?.filter((loan: any) => loan.status === 'APPROVED').length || 0;
  const disbursedCount = loanApplications?.filter((loan: any) => loan.status === 'DISBURSED').length || 0;

  const LoanCard = ({ loan }: { loan: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Loan #{loan.id}</h3>
            <p className="text-muted-foreground">{getMemberName(loan.memberId)}</p>
          </div>
          <Badge className={statusColors[loan.status as keyof typeof statusColors]}>
            {loan.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Amount:</span>
            <p className="font-semibold text-lg">₹{parseFloat(loan.amount).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Purpose:</span>
            <p className="font-medium">{loan.purpose}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Tenure:</span>
            <p className="font-medium">{loan.tenure} months</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Applied:</span>
            <p className="font-medium">{new Date(loan.appliedDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSelectedLoan(loan)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Loan Application Details</DialogTitle>
              </DialogHeader>
              {selectedLoan && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Applicant</label>
                      <p className="font-semibold">{getMemberName(selectedLoan.memberId)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Loan Amount</label>
                      <p className="font-semibold">₹{parseFloat(selectedLoan.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                      <p className="font-semibold">{selectedLoan.purpose}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tenure</label>
                      <p className="font-semibold">{selectedLoan.tenure} months</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                      <p className="font-semibold">₹{parseFloat(selectedLoan.monthlyIncome || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge className={statusColors[selectedLoan.status as keyof typeof statusColors]}>
                        {selectedLoan.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purpose Description</label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedLoan.purposeDescription}</p>
                  </div>

                  {selectedLoan.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveLoanMutation.mutate(selectedLoan.id)}
                        disabled={approveLoanMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" className="flex-1">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {selectedLoan.status === 'APPROVED' && (
                    <Button
                      onClick={() => disburseLoanMutation.mutate(selectedLoan.id)}
                      disabled={disburseLoanMutation.isPending}
                      className="w-full"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Disburse Amount
                    </Button>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {loan.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                onClick={() => approveLoanMutation.mutate(loan.id)}
                disabled={approveLoanMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button size="sm" variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}

          {loan.status === 'APPROVED' && (
            <Button
              size="sm"
              onClick={() => disburseLoanMutation.mutate(loan.id)}
              disabled={disburseLoanMutation.isPending}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Disburse
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('nav.loanApprovals')}</h1>
        <p className="text-muted-foreground">Review and manage loan applications</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{disbursedCount}</p>
                <p className="text-sm text-muted-foreground">Disbursed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by member name or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="DISBURSED">Disbursed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loan Applications */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="disbursed">
            Disbursed ({disbursedCount})
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted/50 rounded animate-pulse" />
                      <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredLoans?.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No loan applications found</p>
                  <p className="text-sm">
                    {activeTab === 'pending' ? 'No applications pending approval' : 
                     activeTab === 'approved' ? 'No approved applications' :
                     activeTab === 'disbursed' ? 'No disbursed loans' :
                     'No loan applications match your criteria'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLoans?.map((loan: any) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
