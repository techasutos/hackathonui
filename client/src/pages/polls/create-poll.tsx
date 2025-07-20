import { useAuth } from "@/hooks/use-auth";
import { CreatePollForm } from "@/components/ui/create-poll-form";
import MainFrame from "@/components/layout/MainFrame";

export default function CreatePollPage() {
  const { hasAnyRole } = useAuth();
  

  if (!hasAnyRole(["ADMIN", "PRESIDENT"])) {
    return <div className="text-muted-foreground text-sm">Access Denied</div>;
  }

  return (
   <MainFrame>
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Poll</h1>
      <CreatePollForm />
    </div>
   </MainFrame>	
  );
}

