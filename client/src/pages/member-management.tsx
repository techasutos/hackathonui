import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { apiService } from "@/lib/api";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Download
} from "lucide-react";
import type { Member, InsertMember } from "@shared/schema";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().regex(/^\+?91?\d{10}$/, "Invalid phone number"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  groupId: z.string().min(1, "Group selection is required"),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function MemberManagement() {
  const { t } = useLanguage();
  const { canAccess } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Check permissions
  if (!canAccess(['ADMIN', 'PRESIDENT'])) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access member management.</p>
          </div>
        </div>
      </div>
    );
  }

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['/api/members'],
    queryFn: () => apiService.getMembers()
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['/api/groups'],
    queryFn: () => apiService.getGroups()
  });

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      aadhaar: "",
      gender: "",
      email: "",
      phone: "",
      address: "",
      groupId: "",
    }
  });

  const createMemberMutation = useMutation({
    mutationFn: (data: InsertMember) => apiService.createMember(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create member",
        variant: "destructive",
      });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertMember> }) => 
      apiService.updateMember(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      setIsEditDialogOpen(false);
      setEditingMember(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteMember(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: MemberFormData) => {
    const memberData: InsertMember = {
      ...data,
      groupId: parseInt(data.groupId),
      isApproved: false
    };

    if (editingMember) {
      updateMemberMutation.mutate({ id: editingMember.id, data: memberData });
    } else {
      createMemberMutation.mutate(memberData);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      aadhaar: member.aadhaar || "",
      gender: member.gender || "",
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
      groupId: member.groupId?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleApprove = async (member: Member) => {
    try {
      await updateMemberMutation.mutateAsync({ 
        id: member.id, 
        data: { isApproved: true } 
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const filteredMembers = members?.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.aadhaar?.includes(searchTerm) ||
                         member.phone?.includes(searchTerm);
    const matchesGroup = selectedGroup === "all" || member.groupId?.toString() === selectedGroup;
    return matchesSearch && matchesGroup;
  }) || [];

  const exportMembers = () => {
    // Create CSV content
    const headers = ['Name', 'Aadhaar', 'Gender', 'Phone', 'Email', 'Status', 'Group'];
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        member.name,
        member.aadhaar,
        member.gender,
        member.phone,
        member.email,
        member.isApproved ? 'Approved' : 'Pending',
        groups?.find(g => g.id === member.groupId)?.name || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('nav.memberManagement')}</h1>
            <p className="text-muted-foreground">Manage SHG members and their approvals</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportMembers} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <MemberForm 
                  form={form} 
                  onSubmit={handleSubmit} 
                  groups={groups || []}
                  isLoading={createMemberMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups?.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Members ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.aadhaar ? `Aadhaar: ${member.aadhaar}` : 'No Aadhaar'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{member.phone}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {groups?.find(g => g.id === member.groupId)?.name || 'No Group'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.isApproved ? "default" : "secondary"}>
                            {member.isApproved ? t('common.approved') : t('common.pending')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!member.isApproved && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApprove(member)}
                                disabled={updateMemberMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteMemberMutation.mutate(member.id)}
                              disabled={deleteMemberMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredMembers.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <UserPlus className="h-12 w-12" />
                    </div>
                    <h3 className="empty-state-title">No members found</h3>
                    <p className="empty-state-description">
                      {searchTerm || selectedGroup !== "all" 
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by adding your first member"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
            </DialogHeader>
            <MemberForm 
              form={form} 
              onSubmit={handleSubmit} 
              groups={groups || []}
              isLoading={updateMemberMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Member Form Component
interface MemberFormProps {
  form: any;
  onSubmit: (data: MemberFormData) => void;
  groups: any[];
  isLoading: boolean;
}

function MemberForm({ form, onSubmit, groups, isLoading }: MemberFormProps) {
  const { t } = useLanguage();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="aadhaar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhaar Number *</FormLabel>
                <FormControl>
                  <Input placeholder="XXXX XXXX XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input placeholder="+91 XXXXX XXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <Input placeholder="Enter complete address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading && <div className="loading-spinner mr-2" />}
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
