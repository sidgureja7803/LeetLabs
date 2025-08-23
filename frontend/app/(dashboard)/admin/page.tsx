"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAPI } from "@/lib/api";
import { Overview } from "@/components/dashboard/overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PlusCircle, Trash2, BookOpen, UserPlus, PenSquare, Users, BookOpen as Book } from "lucide-react";

// Types
type Department = {
  id: string;
  name: string;
  code: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  department: Department;
  semester: number;
  teachers: Teacher[];
};

type Teacher = {
  id: string;
  name: string;
  email: string;
  department: Department;
  subjects: Subject[];
};

export default function AdminDashboard() {
  // Stats state
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalSubjects: 0,
    totalDepartments: 0
  });
  
  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    departmentId: "",
    semester: 1
  });
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  
  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    departmentId: "",
    password: "123456" // Default password
  });
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  
  // Department options
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Teacher-Subject mapping state
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch dashboard data instead of API calls
    const mockFetchData = () => {
      // Mock departments data
      const mockDepartments = [
        { id: "1", name: "Computer Science Engineering", code: "CSED" },
        { id: "2", name: "Electronics & Communication", code: "ECED" },
        { id: "3", name: "Mechanical Engineering", code: "MED" },
        { id: "4", name: "Electrical Engineering", code: "EED" },
        { id: "5", name: "Civil Engineering", code: "CED" }
      ];
      
      // Mock teachers data
      const mockTeachers = [
        { 
          id: "1", 
          name: "Dr. Amrita Sharma", 
          email: "amrita@thapar.edu", 
          department: mockDepartments[0],
          subjects: []
        },
        { 
          id: "2", 
          name: "Dr. Maninder Singh", 
          email: "maninder@thapar.edu", 
          department: mockDepartments[0],
          subjects: []
        },
        { 
          id: "3", 
          name: "Dr. Ravi Kumar", 
          email: "rkumar@thapar.edu", 
          department: mockDepartments[0],
          subjects: []
        },
        { 
          id: "4", 
          name: "Dr. Sanjay Sharma", 
          email: "sanjay@thapar.edu", 
          department: mockDepartments[1],
          subjects: []
        },
        { 
          id: "5", 
          name: "Dr. Priya Gupta", 
          email: "priya@thapar.edu", 
          department: mockDepartments[2],
          subjects: []
        }
      ];
      
      // Mock subjects data
      const mockSubjects = [
        { 
          id: "1", 
          name: "Operating Systems", 
          code: "UCS303", 
          department: mockDepartments[0],
          semester: 3,
          teachers: [mockTeachers[0], mockTeachers[2]]
        },
        { 
          id: "2", 
          name: "Data Structures & Algorithms", 
          code: "UCS301", 
          department: mockDepartments[0],
          semester: 3,
          teachers: [mockTeachers[1]]
        },
        { 
          id: "3", 
          name: "Database Management Systems", 
          code: "UCS305", 
          department: mockDepartments[0],
          semester: 4,
          teachers: [mockTeachers[0]]
        },
        { 
          id: "4", 
          name: "Numerical Analysis", 
          code: "UMA031", 
          department: mockDepartments[0],
          semester: 3,
          teachers: [mockTeachers[2]]
        },
        { 
          id: "5", 
          name: "Engineering Materials", 
          code: "UES023", 
          department: mockDepartments[2],
          semester: 2,
          teachers: [mockTeachers[4]]
        },
        { 
          id: "6", 
          name: "Discrete Mathematics", 
          code: "UMA058", 
          department: mockDepartments[0],
          semester: 2,
          teachers: [mockTeachers[1]]
        },
        { 
          id: "7", 
          name: "Computer Networks", 
          code: "UCS405", 
          department: mockDepartments[0],
          semester: 4,
          teachers: [mockTeachers[0], mockTeachers[2]]
        },
      ];
      
      // Update teacher's subjects references
      mockTeachers.forEach(teacher => {
        teacher.subjects = mockSubjects.filter(subject => 
          subject.teachers.some(t => t.id === teacher.id)
        ) as typeof mockSubjects;
      });
      
      // Mock stats
      const mockStats = {
        totalTeachers: mockTeachers.length,
        totalStudents: 850,
        totalSubjects: mockSubjects.length,
        totalDepartments: mockDepartments.length
      };
      
      // Update state with mock data
      setStats(mockStats);
      setDepartments(mockDepartments);
      setTeachers(mockTeachers);
      setSubjects(mockSubjects);
      setLoading(false);
    };
    
    mockFetchData();
  }, []);

  // Handler for adding a new subject
  const handleAddSubject = () => {
    const newSubjectObj = {
      id: `${subjects.length + 1}`,
      name: newSubject.name,
      code: newSubject.code,
      department: departments.find(d => d.id === newSubject.departmentId) || departments[0],
      semester: newSubject.semester,
      teachers: []
    };
    setSubjects([...subjects, newSubjectObj]);
    setNewSubject({ name: "", code: "", departmentId: "", semester: 1 });
    setSubjectDialogOpen(false);
  };

  // Handler for adding a new teacher
  const handleAddTeacher = () => {
    const newTeacherObj = {
      id: `${teachers.length + 1}`,
      name: newTeacher.name,
      email: newTeacher.email,
      department: departments.find(d => d.id === newTeacher.departmentId) || departments[0],
      subjects: []
    };
    setTeachers([...teachers, newTeacherObj]);
    setNewTeacher({ name: "", email: "", departmentId: "", password: "123456" });
    setTeacherDialogOpen(false);
  };

  // Handler for assigning a teacher to a subject
  const handleAssignTeacherToSubject = () => {
    if (!selectedSubjectId || !selectedTeacherId) return;
    
    const updatedSubjects = subjects.map(subject => {
      if (subject.id === selectedSubjectId) {
        const teacher = teachers.find(t => t.id === selectedTeacherId);
        if (teacher && !subject.teachers.some(t => t.id === teacher.id)) {
          return {
            ...subject,
            teachers: [...subject.teachers, teacher]
          };
        }
      }
      return subject;
    });
    
    setSubjects(updatedSubjects);
    
    // Update teacher's subjects
    const updatedTeachers = teachers.map(teacher => {
      if (teacher.id === selectedTeacherId) {
        const subject = subjects.find(s => s.id === selectedSubjectId);
        if (subject && !teacher.subjects.some(s => s.id === subject.id)) {
          return {
            ...teacher,
            subjects: [...teacher.subjects, subject]
          };
        }
      }
      return teacher;
    });
    
    setTeachers(updatedTeachers);
    setAssignDialogOpen(false);
    setSelectedSubjectId("");
    setSelectedTeacherId("");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div>
          <p className="text-sm text-gray-500">Department Head</p>
          <p className="text-sm font-medium">Dr. Rajesh Kumar (head.csed@thapar.edu)</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalTeachers}
            </div>
            <p className="text-xs text-muted-foreground">
              Active teachers in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Active students in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalSubjects}
            </div>
            <p className="text-xs text-muted-foreground">
              Active subjects being taught
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalDepartments}
            </div>
            <p className="text-xs text-muted-foreground">
              Active departments in the system
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Management Tabs */}
      <Tabs defaultValue="subjects" className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="subjects" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Subjects
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <Users className="w-4 h-4" /> Teachers
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAssignDialogOpen(true)} 
              className="flex items-center gap-1"
            >
              <PenSquare className="w-4 h-4" /> Assign Teacher
            </Button>
            <Button 
              size="sm" 
              onClick={() => setSubjectDialogOpen(true)} 
              className="flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" /> Add Subject
            </Button>
            <Button 
              size="sm" 
              onClick={() => setTeacherDialogOpen(true)} 
              className="flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" /> Add Teacher
            </Button>
          </div>
        </div>
        
        {/* Subjects Tab Content */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <Card key={subject.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription>{subject.code} | Semester {subject.semester}</CardDescription>
                    </div>
                    <Badge variant="outline">{subject.department.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">Assigned Teachers:</p>
                  {subject.teachers.length > 0 ? (
                    <ul className="space-y-1">
                      {subject.teachers.map(teacher => (
                        <li key={teacher.id} className="text-sm flex justify-between">
                          <span>{teacher.name}</span>
                          <span className="text-gray-500 text-xs">{teacher.email}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No teachers assigned</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Teachers Tab Content */}
        <TabsContent value="teachers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map(teacher => (
              <Card key={teacher.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{teacher.name}</CardTitle>
                      <CardDescription>{teacher.email}</CardDescription>
                    </div>
                    <Badge variant="outline">{teacher.department.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">Teaching Subjects:</p>
                  {teacher.subjects.length > 0 ? (
                    <ul className="space-y-1">
                      {teacher.subjects.map(subject => (
                        <li key={subject.id} className="text-sm">
                          {subject.name} <span className="text-gray-500">({subject.code})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No subjects assigned</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Overview and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
      
      {/* Add Subject Dialog */}
      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Create a new subject that will be available to students and teachers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                placeholder="e.g., Database Management Systems"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                value={newSubject.code}
                onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                placeholder="e.g., UCS305"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newSubject.departmentId}
                onValueChange={(value: string) => setNewSubject({...newSubject, departmentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={newSubject.semester.toString()}
                onValueChange={(value: string) => setNewSubject({...newSubject, semester: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubject}>Add Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Teacher Dialog */}
      <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Create a new teacher account with department assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="teacher-name">Full Name</Label>
              <Input
                id="teacher-name"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                placeholder="e.g., Dr. John Smith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-email">Email</Label>
              <Input
                id="teacher-email"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                placeholder="e.g., jsmith@thapar.edu"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-department">Department</Label>
              <Select
                value={newTeacher.departmentId}
                onValueChange={(value: string) => setNewTeacher({...newTeacher, departmentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-password">Default Password</Label>
              <Input
                id="teacher-password"
                value={newTeacher.password}
                disabled
                type="password"
              />
              <p className="text-xs text-gray-500">Default password is set to "123456"</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeacherDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTeacher}>Add Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Teacher to Subject Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher to Subject</DialogTitle>
            <DialogDescription>
              Link a teacher to a subject for the academic year.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assign-subject">Subject</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assign-teacher">Teacher</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignTeacherToSubject}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
