import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Vote, Clock, Users } from "lucide-react";
import { Poll, PollVote } from "@shared/schema";

interface PollItemProps {
  poll: Poll;
  showResults?: boolean;
}

export function PollItem({ poll, showResults = false }: PollItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState("");

  const { data: votes } = useQuery({
    queryKey: ["/api/polls", poll.id, "votes"],
    enabled: showResults || !poll.isActive,
  });

  const voteMutation = useMutation({
    mutationFn: async (option: string) => {
      const response = await apiRequest("POST", `/api/polls/${poll.id}/vote`, {
        selectedOption: option,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Vote Recorded",
        description: "Your vote has been successfully recorded",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      });
    },
  });

  const handleVote = () => {
    if (!selectedOption) {
      toast({
        title: "No Option Selected",
        description: "Please select an option before voting",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(selectedOption);
  };

  const options = Array.isArray(poll.options) ? poll.options : [];
  const totalVotes = votes?.length || 0;
  
  const getVoteCount = (option: string) => {
    return votes?.filter((vote: PollVote) => vote.selectedOption === option).length || 0;
  };

  const getVotePercentage = (option: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((getVoteCount(option) / totalVotes) * 100);
  };

  const isExpired = poll.closedAt && new Date(poll.closedAt) < new Date();
  const canVote = poll.isActive && !isExpired && !showResults;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{poll.title}</CardTitle>
          <Badge variant={poll.isActive ? "default" : "secondary"}>
            {poll.isActive ? "Active" : "Closed"}
          </Badge>
        </div>
        {poll.description && (
          <p className="text-muted-foreground">{poll.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {canVote ? (
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {options.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value || option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option.label || option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button
              onClick={handleVote}
              disabled={voteMutation.isPending || !selectedOption}
              className="w-full"
            >
              {voteMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Vote...
                </div>
              ) : (
                <>
                  <Vote className="mr-2 h-4 w-4" />
                  Submit Vote
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {options.map((option: any, index: number) => {
              const voteCount = getVoteCount(option.value || option);
              const percentage = getVotePercentage(option.value || option);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{option.label || option}</span>
                    <span className="text-sm text-muted-foreground">
                      {percentage}% ({voteCount} votes)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{totalVotes} votes</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {poll.isActive ? "Active" : `Closed ${new Date(poll.closedAt || poll.createdAt).toLocaleDateString()}`}
              </span>
            </div>
          </div>
          
          <span className="text-xs">
            Created {new Date(poll.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
