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
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Key,
  Users,
  Settings
} from "lucide-react";
import type { Role, InsertRole, Permission } from "@shared/schema";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function RoleManagement() {
  const { t } = useLanguage();
  const { canAccess } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Check permissions - only admins can manage roles
  if (!canAccess(['ADMIN'])) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access role management.</p>
          </div>
        </div>
      </div>
    );
  }

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: () => apiService.getRoles()
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: () => apiService.getPermissions()
  });

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    }
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: InsertRole) => apiService.createRole(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertRole> }) => 
      apiService.updateRole(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsEditDialogOpen(false);
      setEditingRole(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteRole(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: RoleFormData) => {
    const roleData: InsertRole = {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    };

    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: roleData });
    } else {
      createRoleMutation.mutate(roleData);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setIsEditDialogOpen(true);
  };

  const filteredRoles = roles?.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const groupPermissionsByResource = () => {
    if (!permissions) return {};
    
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const permissionGroups = groupPermissionsByResource();

  const getPermissionName = (permissionName: string) => {
    const permission = permissions?.find(p => p.name === permissionName);
    return permission?.description || permissionName;
  };

  // System roles that cannot be deleted
  const systemRoles = ['ADMIN', 'PRESIDENT', 'TREASURER', 'MEMBER'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('nav.roleManagement')}</h1>
            <p className="text-muted-foreground">Manage roles and permissions for users</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
              </DialogHeader>
              <RoleForm 
                form={form} 
                onSubmit={handleSubmit} 
                permissionGroups={permissionGroups}
                isLoading={createRoleMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Roles ({filteredRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rolesLoading || permissionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="font-medium">{role.name}</span>
                            {systemRoles.includes(role.name) && (
                              <Badge variant="secondary" className="text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {role.description || 'No description'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {role.permissions?.slice(0, 3).map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {getPermissionName(permission)}
                              </Badge>
                            ))}
                            {(role.permissions?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(role.permissions?.length || 0) - 3} more
                              </Badge>
                            )}
                            {role.permissions?.includes('*') && (
                              <Badge variant="destructive" className="text-xs">
                                All Permissions
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(role)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!systemRoles.includes(role.name) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteRoleMutation.mutate(role.id)}
                                disabled={deleteRoleMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredRoles.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Shield className="h-12 w-12" />
                    </div>
                    <h3 className="empty-state-title">No roles found</h3>
                    <p className="empty-state-description">
                      {searchTerm 
                        ? "Try adjusting your search criteria"
                        : "System roles are already configured"
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <RoleForm 
              form={form} 
              onSubmit={handleSubmit} 
              permissionGroups={permissionGroups}
              isLoading={updateRoleMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Role Form Component
interface RoleFormProps {
  form: any;
  onSubmit: (data: RoleFormData) => void;
  permissionGroups: Record<string, Permission[]>;
  isLoading: boolean;
}

function RoleForm({ form, onSubmit, permissionGroups, isLoading }: RoleFormProps) {
  const { t } = useLanguage();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter role name" {...field} />
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
                  placeholder="Enter role description" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permissions *</FormLabel>
              <div className="space-y-4 border rounded-lg p-4 max-h-64 overflow-y-auto">
                {/* All Permissions Option */}
                <div className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id="all-permissions"
                    checked={field.value.includes('*')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange(['*']);
                      } else {
                        field.onChange([]);
                      }
                    }}
                  />
                  <label htmlFor="all-permissions" className="text-sm font-medium">
                    <Badge variant="destructive" className="text-xs mr-2">
                      Super Admin
                    </Badge>
                    All Permissions
                  </label>
                </div>
                
                {/* Individual Permissions by Resource */}
                {!field.value.includes('*') && Object.entries(permissionGroups).map(([resource, permissions]) => (
                  <div key={resource} className="space-y-2">
                    <h4 className="font-medium text-sm capitalize flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      {resource} Permissions
                    </h4>
                    <div className="grid grid-cols-1 gap-2 ml-6">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.name}
                            checked={field.value.includes(permission.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, permission.name]);
                              } else {
                                field.onChange(field.value.filter((p: string) => p !== permission.name));
                              }
                            }}
                          />
                          <label htmlFor={permission.name} className="text-sm">
                            {permission.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
