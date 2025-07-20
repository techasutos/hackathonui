import  axios  from "@/hooks/axios";

// ✅ Fetch loans by group
export const getLoansByGroup = async (groupId: number, status?: string) => {
  const url = status ? `/loans/group/${groupId}?status=${status}` : `/loans/group/${groupId}`;
  const res = await axios.get(url);
  return res.data;
};

// ✅ Approve a loan
export const approveLoan = (loanId: number) => axios.post(`/loans/${loanId}/approve`);

// ✅ Reject a loan
export const rejectLoan = (loanId: number) => axios.post(`/loans/${loanId}/reject`);

// ✅ Disburse a loan
export const disburseLoan = (loanId: number) => axios.post(`/loans/${loanId}/disburse`);

// ✅ Repay a loan (only for member)
export const repayLoan = (loanId: number, amount: number) =>
  axios.post(`/loans/${loanId}/repay`, { amount });

// ✅ Get audit logs for a loan
export const getLoanLogs = (loanId: number) => axios.get(`/loans/${loanId}/logs`);

// ✅ Get current user's loans
export const getMyLoans = () => axios.get("/loans/my");

// ✅ Get overdue loans for a group
export const getOverdueLoans = (groupId: number) => axios.get(`/loans/group/${groupId}/overdue`);

// ✅ Get overdue members in a group
export const getOverdueMembers = (groupId: number) =>
  axios.get(`/loans/group/${groupId}/overdue-members`);

// ✅ Get repayments for a month (for treasurer/admin)
export const getMonthlyRepayments = (groupId: number, year: number, month: number) =>
  axios.get(`/loans/group/${groupId}/repayments`, {
    params: { year, month },
  });