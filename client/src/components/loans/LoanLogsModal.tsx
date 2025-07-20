import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLoanLogs } from "@/services/loanService";

export default function LoanLogsModal({ loanId, open, onClose }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (open) {
      getLoanLogs(loanId).then((res) => setLogs(res.data));
    }
  }, [open, loanId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Audit Logs - Loan #{loanId}</DialogTitle></DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto text-sm">
          {logs.map((log) => (
            <div key={log.id} className="p-2 border-b">
              <b>{log.status}</b> by <i>{log.performedBy}</i><br />
              {log.description}<br />
              <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}