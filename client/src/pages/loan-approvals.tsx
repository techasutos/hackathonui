import { useAuth } from "@/hooks/use-auth";
import LoanTable from "@/components/loans/LoanTable";
import MainFrame from "@/components/layout/MainFrame";

export default function LoanApprovals() {
  const { user } = useAuth();

  if (!user) return <div>Authenticating...</div>;
  if (!user.groupId) return <div>Your group information is missing.</div>;

  const role = user.roles?.[0] ?? "MEMBER";
  const groupId = user.groupId;

  return (
  <MainFrame>
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Loan Applications</h1>
      <LoanTable groupId={groupId} userRole={role} />
    </div>
  </MainFrame>
  );
}