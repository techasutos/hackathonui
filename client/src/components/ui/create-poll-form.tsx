import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, X } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  groupId: z.number().min(1, "Group ID required"),
  question: z.string().min(1, "Question is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  options: z
    .array(
      z.object({
        value: z.string().min(1, "Option value required"),
        label: z.string().min(1, "Option label required"),
      })
    )
    .min(2, "At least 2 options are required")
    .max(4, "Maximum 4 options allowed"),
});

export function CreatePollForm() {
  const { member } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: member?.groupId || 0,
      question: "",
      description: "",
      deadline: "",
      options: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/polls", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({ title: "Poll created", description: "Success!" });
      form.reset();
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Poll creation failed",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createPollMutation.mutate(data);
  };

  const addOption = () => {
    if (fields.length < 4) {
      append({ value: "", label: "" });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="poll-question">Poll Question</FormLabel>
              <FormControl>
                <Input id="poll-question" {...field} placeholder="Enter your question" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="poll-description">Description (optional)</FormLabel>
              <FormControl>
                <Textarea id="poll-description" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="poll-deadline">Deadline</FormLabel>
              <FormControl>
                <Input id="poll-deadline" type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Poll Options</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={fields.length >= 4}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          </div>

          {fields.map((item, index) => {
            const valueId = `option-value-${index}`;
            const labelId = `option-label-${index}`;
            return (
              <div key={item.id} className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name={`options.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel htmlFor={valueId}>Value</FormLabel>
                      <FormControl>
                        <Input id={valueId} {...field} placeholder="e.g. yes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`options.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel htmlFor={labelId}>Label</FormLabel>
                      <FormControl>
                        <Input id={labelId} {...field} placeholder="e.g. Yes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="mt-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Hidden groupId field */}
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <input type="hidden" {...field} value={member?.groupId || 0} />
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid || createPollMutation.isPending}
        >
          {createPollMutation.isPending ? "Creating..." : "Create Poll"}
        </Button>
      </form>
    </Form>
  );
}