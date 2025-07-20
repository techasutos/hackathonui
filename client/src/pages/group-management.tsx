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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  UserCheck,
  Download
} from "lucide-react";
import type { Group, InsertGroup } from "@shared/schema";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
});

type GroupFormData = z.infer<typeof groupSchema>;

export default function GroupManagement() {
  const { t } = useLanguage();
  const { canAccess } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Check permissions
  if (!canAccess(['ADMIN', 'PRESIDENT'])) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access group management.</p>
          </div>
        </div>
      </div>
    );
  }

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['/api/groups'],
    queryFn: () => apiService.getGroups()
  });

  const { data: members } = useQuery({
    queryKey: ['/api/members'],
    queryFn: () => apiService.getMembers()
  });

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: InsertGroup) => apiService.createGroup(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertGroup> }) => 
      apiService.updateGroup(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setIsEditDialogOpen(false);
      setEditingGroup(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteGroup(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: GroupFormData) => {
    const groupData: InsertGroup = {
      ...data,
      totalMembers: 0,
      isActive: true,
    };

    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data: groupData });
    } else {
      createGroupMutation.mutate(groupData);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    form.reset({
      name: group.name,
      description: group.description || "",
      location: group.location || "",
    });
    setIsEditDialogOpen(true);
  };

  const getGroupMemberCount = (groupId: number) => {
    return members?.filter(member => member.groupId === groupId).length || 0;
  };

  const getGroupMemberStats = (groupId: number) => {
    const groupMembers = members?.filter(member => member.groupId === groupId) || [];
    const approved = groupMembers.filter(member => member.isApproved).length;
    const pending = groupMembers.length - approved;
    return { total: groupMembers.length, approved, pending };
  };

  const filteredGroups = groups?.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const exportGroups = () => {
    const headers = ['Name', 'Location', 'Description', 'Total Members', 'Approved Members', 'Status', 'Created'];
    const csvContent = [
      headers.join(','),
      ...filteredGroups.map(group => {
        const stats = getGroupMemberStats(group.id);
        return [
          group.name,
          group.location || '',
          group.description || '',
          stats.total,
          stats.approved,
          group.isActive ? 'Active' : 'Inactive',
          group.createdAt ? new Date(group.createdAt).toLocaleDateString() : ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'groups.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('nav.groupManagement')}</h1>
            <p className="text-muted-foreground">Manage Self Help Groups and their information</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportGroups} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Group</DialogTitle>
                </DialogHeader>
                <GroupForm 
                  form={form} 
                  onSubmit={handleSubmit} 
                  isLoading={createGroupMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid/Table */}
        <div className="grid lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Groups ({filteredGroups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Details</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group) => {
                        const stats = getGroupMemberStats(group.id);
                        return (
                          <TableRow key={group.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-lg">{group.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {group.description || 'No description'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{group.location || 'Not specified'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">{stats.approved} approved</span>
                                </div>
                                {stats.pending > 0 && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-amber-400" />
                                    <span className="text-sm">{stats.pending} pending</span>
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  Total: {stats.total}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={group.isActive ? "default" : "secondary"}>
                                {group.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEdit(group)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteGroupMutation.mutate(group.id)}
                                  disabled={deletGroupMutation.isPending || stats.total > 0}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {filteredGroups.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Users className="h-12 w-12" />
                      </div>
                      <h3 className="empty-state-title">No groups found</h3>
                      <p className="empty-state-description">
                        {searchTerm 
                          ? "Try adjusting your search criteria"
                          : "Get started by creating your first Self Help Group"
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            <GroupForm 
              form={form} 
              onSubmit={handleSubmit} 
              isLoading={updateGroupMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Group Form Component
interface GroupFormProps {
  form: any;
  onSubmit: (data: GroupFormData) => void;
  isLoading: boolean;
}

function GroupForm({ form, onSubmit, isLoading }: GroupFormProps) {
  const { t } = useLanguage();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location *</FormLabel>
              <FormControl>
                <Input placeholder="Enter location" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter group description" 
                  rows={3}
                  {...field} 
                />
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
