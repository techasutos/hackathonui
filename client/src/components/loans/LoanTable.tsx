import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  approveLoan,
  rejectLoan,
  disburseLoan,
  getLoansByGroup,
} from "@/services/loanService";
import LoanLogsModal from "./LoanLogsModal";

const ROWS_PER_PAGE = 10;

export default function LoanTable({ groupId, userRole }) {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLoans = async (status) => {
    try {
      const data = await getLoansByGroup(
        groupId,
        status === "ALL" ? undefined : status
      );
      setLoans(data);
      setCurrentPage(1); // Reset to first page on filter change
    } catch (error) {
      console.error("❌ Error fetching loans:", error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchLoans(statusFilter);
    }
  }, [groupId, statusFilter]);

  const handleAction = async (loanId: number, action: string) => {
    try {
      if (action === "approve") await approveLoan(loanId);
      if (action === "reject") await rejectLoan(loanId);
      if (action === "disburse") await disburseLoan(loanId);
      await fetchLoans(statusFilter);
    } catch (error) {
      console.error(`❌ Failed to ${action} loan`, error);
    }
  };

  const renderActions = (loan) => {
    const { id, status } = loan;
    const items = [];

    if (userRole === "ADMIN" || (userRole === "PRESIDENT" && status === "PENDING")) {
      items.push(
        <DropdownMenuItem key="approve" onClick={() => handleAction(id, "approve")}>
          Approve
        </DropdownMenuItem>,
        <DropdownMenuItem key="reject" onClick={() => handleAction(id, "reject")}>
          Reject
        </DropdownMenuItem>
      );
    }

    if (userRole === "ADMIN" || (userRole === "TREASURER" && status === "APPROVED")) {
      items.push(
        <DropdownMenuItem key="disburse" onClick={() => handleAction(id, "disburse")}>
          Disburse
        </DropdownMenuItem>
      );
    }

    items.push(
      <DropdownMenuItem key="logs" onClick={() => setSelectedLoanId(id)}>
        View Logs
      </DropdownMenuItem>
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>{items}</DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const totalPages = Math.ceil(loans.length / ROWS_PER_PAGE);
  const paginatedLoans = loans.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  return (
    <div className="p-4 rounded-lg backdrop-blur bg-white/60 dark:bg-slate-800/40 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="DISBURSED">Disbursed</SelectItem>
            <SelectItem value="REPAID">Repaid</SelectItem>
          </SelectContent>
        </Select>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <table className="w-full text-sm rounded overflow-hidden border border-gray-300 dark:border-gray-700">
        <thead className="bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-800 text-gray-700 dark:text-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Member</th>
            <th className="px-3 py-2 text-left">Amount</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Purpose</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedLoans.length > 0 ? (
            paginatedLoans.map((loan, idx) => (
              <tr
                key={loan.id}
                className={idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-indigo-50 dark:bg-slate-800"}
              >
                <td className="px-3 py-2">{loan.id}</td>
                <td className="px-3 py-2">{loan.memberName}</td>
                <td className="px-3 py-2">{loan.amount}</td>
                <td className="px-3 py-2">{loan.status}</td>
                <td className="px-3 py-2">{loan.purpose}</td>
                <td className="px-3 py-2">{renderActions(loan)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-gray-400 py-4">
                No loan applications found for selected status.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedLoanId && (
        <LoanLogsModal
          loanId={selectedLoanId}
          open={true}
          onClose={() => setSelectedLoanId(null)}
        />
      )}
    </div>
  );
}