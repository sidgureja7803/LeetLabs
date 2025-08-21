"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { adminAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Trash2, Mail, User, UserPlus, Download } from 'lucide-react';
import { User as UserType, Department } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT',
    departmentId: '',
    rollNumber: '',
    employeeId: '',
    semester: 1
  });

  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchDepartments()
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error('Error initializing page:', error);
      setLoading(false);
    });
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data?.data?.users || []);
      return res.data?.data?.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await adminAPI.getDepartments();
      setDepartments(res.data?.data?.departments || []);
      return res.data?.data?.departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  };

  const handleCreateUser = async () => {
    try {
      if (newUser.role === 'TEACHER') {
        await adminAPI.createTeacher({
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          employeeId: newUser.employeeId,
          departmentId: newUser.departmentId
        });
      } else {
        // This is a placeholder - you would need to implement this API endpoint
        // await adminAPI.createStudent({
        //   email: newUser.email,
        //   firstName: newUser.firstName,
        //   lastName: newUser.lastName,
        //   rollNumber: newUser.rollNumber,
        //   departmentId: newUser.departmentId,
        //   semester: parseInt(newUser.semester.toString())
        // });
      }
      
      setCreateDialogOpen(false);
      resetNewUserForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const resetNewUserForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'STUDENT',
      departmentId: '',
      rollNumber: '',
      employeeId: '',
      semester: 1
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'TEACHER':
        return 'default';
      case 'STUDENT':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by tab (role)
    const matchesTab = activeTab === 'all' || user.role === activeTab.toUpperCase();
    
    // Filter by department
    const matchesDepartment = departmentFilter === 'all' || user.department?.id === departmentFilter;
    
    // Filter by role (dropdown)
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // Filter by search query
    const matchesSearch = 
      !searchQuery || 
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesDepartment && matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will receive an email with login instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  placeholder="First Name"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  placeholder="Last Name"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={newUser.departmentId} onValueChange={(value) => setNewUser({...newUser, departmentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === 'STUDENT' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Roll Number</label>
                    <Input
                      placeholder="Roll Number"
                      value={newUser.rollNumber}
                      onChange={(e) => setNewUser({...newUser, rollNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <Select 
                      value={newUser.semester.toString()} 
                      onValueChange={(value) => setNewUser({...newUser, semester: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee ID</label>
                  <Input
                    placeholder="Employee ID"
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({...newUser, employeeId: e.target.value})}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateUser}
                disabled={
                  !newUser.firstName || 
                  !newUser.lastName || 
                  !newUser.email || 
                  !newUser.departmentId || 
                  (newUser.role === 'STUDENT' && !newUser.rollNumber) ||
                  (newUser.role === 'TEACHER' && !newUser.employeeId)
                }
              >
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="teacher">Teachers</TabsTrigger>
          <TabsTrigger value="student">Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User List</CardTitle>
              <CardDescription>Manage users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="w-full md:w-1/3">
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by name, email, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-sm font-medium mb-1 block">Filter by Department</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-sm font-medium mb-1 block">Filter by Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-10">
                  <User className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-600">No users found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {users.length === 0
                      ? "There are no users in the system yet."
                      : "No users match your current filters."}
                  </p>
                  {users.length > 0 && (
                    <Button variant="outline" className="mt-4" onClick={() => {
                      setSearchQuery('');
                      setDepartmentFilter('all');
                      setRoleFilter('all');
                      setActiveTab('all');
                    }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.department?.name || '-'}</TableCell>
                        <TableCell>
                          {user.role === 'STUDENT' ? user.rollNumber : user.role === 'TEACHER' ? user.employeeId : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "success" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4" />
                            </Button>
                            {user.role !== 'ADMIN' && (
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
