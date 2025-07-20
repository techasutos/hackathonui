import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import MainFrame from "@/components/layout/MainFrame";
import {
  fetchMyDeposits,
  depositSaving,
  fetchGroupDeposits,
  fetchGroupSummary,
} from "@/services/savingService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function SavingPage() {
  const { user } = useAuth();
  const role = user?.roles?.[0] ?? "";
  const isMember = role === "MEMBER";
  const isAdmin = role === "PRESIDENT" || role === "ADMIN";

  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isMember) {
        const myDeposits = await fetchMyDeposits();
        setDeposits(Array.isArray(myDeposits) ? myDeposits : []);
      } else if (isAdmin) {
        const groupData = await fetchGroupDeposits();
        const summaryData = await fetchGroupSummary();
        setDeposits(Array.isArray(groupData) ? groupData : []);
        setSummary(summaryData);
      }
    } catch (err) {
      console.error("Failed to load saving deposits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleSubmit = async () => {
    if (!amount) return;
    try {
      await depositSaving({ amount: parseFloat(amount), remarks });
      setAmount("");
      setRemarks("");
      await loadData();
    } catch (err) {
      console.error("Deposit failed:", err);
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (!startDate && !endDate) return true;
    const date = new Date(d.date);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    return (!from || date >= from) && (!to || date <= to);
  });

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const downloadCSV = () => {
    const headers = ["Date", "Amount", "Remarks", ...(isAdmin ? ["Member"] : [])];
    const rows = filteredDeposits.map((d) => [
      d.date,
      d.amount,
      d.remarks,
      ...(isAdmin ? [d.memberName ?? "-"] : []),
    ]);
    const csvContent = [headers, ...rows]
      .map((e) => e.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "deposit_history.csv";
    link.click();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Date", "Amount", "Remarks", ...(isAdmin ? ["Member"] : [])];
    const tableRows = filteredDeposits.map((d) => [
      d.date,
      d.amount,
      d.remarks,
      ...(isAdmin ? [d.memberName ?? "-"] : []),
    ]);
    doc.text("Deposit History", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("deposit_history.pdf");
  };

  return (
  <MainFrame>
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Savings</h1>

      {/* Deposit form for Member */}
      {isMember && (
        <div className="bg-white p-4 rounded shadow mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-2">Make a Deposit</h2>
          <div className="flex flex-col gap-3">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      )}

      {/* Group Summary for Admin */}
      {isAdmin && summary && (
		  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6 max-w-xl space-y-2">
			<h2 className="text-xl font-semibold text-gray-800 mb-2">📊 Group Summary</h2>

			<p>
			  <span className="font-medium text-gray-700">Total Deposits:</span>{" "}
			  <span className="text-yellow-600 font-semibold text-lg">₹{summary.totalDeposited}</span>
			</p>

			<p>
			  <span className="font-medium text-gray-700">Number of Deposits:</span>{" "}
			  <span className="text-blue-700 font-semibold">{summary.numberOfDeposits}</span>
			</p>

			<p>
			  <span className="font-medium text-gray-700">Last Updated:</span>{" "}
			  <span className="text-gray-500">{new Date(summary.lastUpdated).toLocaleString()}</span>
			</p>
		  </div>
		)}

      {/* Filters and Export */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="text-sm font-medium">From Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">To Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Items per page</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadCSV} variant="outline">Download CSV</Button>
          <Button onClick={downloadPDF} variant="outline">Download PDF</Button>
        </div>
      </div>

      {/* Deposit History Table */}
      <div className="overflow-x-auto">
        <h2 className="text-lg font-medium mb-2">Deposit History</h2>
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Amount</th>
              <th className="border px-3 py-2">Remarks</th>
              {isAdmin && <th className="border px-3 py-2">Member</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="text-center py-4 text-gray-400">
                  No deposits found.
                </td>
              </tr>
            ) : (
              paginatedDeposits.map((d, index) => (
                <tr key={d.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border px-3 py-2">{d.date}</td>
                  <td className="border px-3 py-2">₹{d.amount}</td>
                  <td className="border px-3 py-2">{d.remarks}</td>
                  {isAdmin && (
                    <td className="border px-3 py-2">{d.memberName ?? "-"}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  </MainFrame>
  );
}