"use client";

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, School, BookOpen, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subjects: number;
    users: number;
  };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDepartments();
      setDepartments(response.data?.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch departments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!formData.name || !formData.code) return;
    
    try {
      setIsSubmitting(true);
      await adminAPI.createDepartment(formData);
      setCreateDialogOpen(false);
      resetForm();
      fetchDepartments();
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: 'Error',
        description: 'Failed to create department',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment || !formData.name || !formData.code) return;
    
    try {
      setIsSubmitting(true);
      await adminAPI.updateDepartment(selectedDepartment.id, formData);
      setEditDialogOpen(false);
      resetForm();
      fetchDepartments();
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: 'Error',
        description: 'Failed to update department',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    
    try {
      setIsSubmitting(true);
      await adminAPI.deleteDepartment(selectedDepartment.id);
      setDeleteDialogOpen(false);
      fetchDepartments();
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete department. It may have associated subjects or users.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: ''
    });
    setSelectedDepartment(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Department</DialogTitle>
              <DialogDescription>
                Add a new department to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Department Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="code">
                  Department Code
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. CSE"
                />
                <p className="text-xs text-gray-500">
                  A short code used to identify the department.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateDepartment}
                disabled={!formData.name || !formData.code || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subjects
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((acc, dept) => acc + (dept._count?.subjects || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((acc, dept) => acc + (dept._count?.users || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            Manage departments across the institute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{department.code}</Badge>
                  </TableCell>
                  <TableCell>{department._count?.subjects || 0}</TableCell>
                  <TableCell>{department._count?.users || 0}</TableCell>
                  <TableCell>{formatDate(department.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(department)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => openDeleteDialog(department)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No departments found. Add your first department to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-name">
                Department Name
              </label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-code">
                Department Code
              </label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateDepartment}
              disabled={!formData.name || !formData.code || isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{selectedDepartment?.name} ({selectedDepartment?.code})</p>
            {(selectedDepartment?._count?.subjects || 0) > 0 || (selectedDepartment?._count?.users || 0) > 0 ? (
              <div className="mt-2 text-sm text-red-500">
                <p>Warning: This department has associated data:</p>
                <ul className="list-disc list-inside mt-1">
                  {(selectedDepartment?._count?.subjects || 0) > 0 && (
                    <li>{selectedDepartment?._count?.subjects} subject(s)</li>
                  )}
                  {(selectedDepartment?._count?.users || 0) > 0 && (
                    <li>{selectedDepartment?._count?.users} user(s)</li>
                  )}
                </ul>
                <p className="mt-1">Deleting this department may affect these items.</p>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteDepartment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
