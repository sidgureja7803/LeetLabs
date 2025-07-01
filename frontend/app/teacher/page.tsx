"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Users, Assignment, ClipboardCheck, Plus, Edit, Eye, Download, Upload } from 'lucide-react';
import { TeacherDashboard, Assignment as AssignmentType, Subject, Submission } from '@/lib/types';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<TeacherDashboard | null>(null);
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    maxMarks: 100,
    semester: 1,
    attachment: null as File | null
  });
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, assignmentsRes, subjectsRes, studentsRes] = await Promise.all([
        api.getTeacherDashboard(),
        api.getTeacherAssignments(),
        api.getTeacherSubjects(),
        api.getTeacherStudents()
      ]);
      setDashboardData(dashRes.data);
      setAssignments(assignmentsRes.data);
      setSubjects(subjectsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const formData = new FormData();
      Object.entries(newAssignment).forEach(([key, value]) => {
        if (value !== null) {
          if (key === 'attachment' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      await api.createAssignment(formData);
      setCreateAssignmentOpen(false);
      setNewAssignment({
        title: '',
        description: '',
        subjectId: '',
        dueDate: '',
        maxMarks: 100,
        semester: 1,
        attachment: null
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      await api.gradeSubmission(selectedSubmission.id, {
        grade: parseFloat(gradeData.grade),
        feedback: gradeData.feedback
      });
      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setGradeData({ grade: '', feedback: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || ''
    });
    setGradeDialogOpen(true);
  };

  const getStatusBadge = (assignment: AssignmentType) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (dueDate > now) {
      return <Badge variant="info">Active</Badge>;
    } else {
      return <Badge variant="warning">Past Due</Badge>;
    }
  };

  const getSubmissionStatusBadge = (submission: Submission) => {
    if (submission.grade !== null) {
      return <Badge variant="success">Graded</Badge>;
    } else {
      return <Badge variant="warning">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
          <p className="text-sm text-gray-500">{dashboardData?.teacher.department}</p>
        </div>
        <Dialog open={createAssignmentOpen} onOpenChange={setCreateAssignmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create a new assignment for your students. You can attach files and set due dates.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Assignment Title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
              />
              <Textarea
                placeholder="Assignment Description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
              />
              <Select value={newAssignment.subjectId} onValueChange={(value) => setNewAssignment({...newAssignment, subjectId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Max Marks"
                  value={newAssignment.maxMarks}
                  onChange={(e) => setNewAssignment({...newAssignment, maxMarks: parseInt(e.target.value)})}
                />
              </div>
              <Select value={newAssignment.semester.toString()} onValueChange={(value) => setNewAssignment({...newAssignment, semester: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm font-medium">Attachment (Optional)</label>
                <Input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) => setNewAssignment({...newAssignment, attachment: e.target.files?.[0] || null})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateAssignmentOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAssignment}>Create Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.totalSubjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Assignment className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.totalAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.totalSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Student submissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.pendingGrading || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assignments</CardTitle>
              <CardDescription>
                Manage assignments across all your subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.subject?.name}</TableCell>
                      <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{assignment.maxMarks}</TableCell>
                      <TableCell>{assignment.submissions?.length || 0}</TableCell>
                      <TableCell>{getStatusBadge(assignment)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Review and grade student submissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.flatMap(a => a.submissions || []).map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.student?.name}</TableCell>
                      <TableCell>{submission.assignment?.title}</TableCell>
                      <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {submission.grade ? `${submission.grade}/${submission.assignment?.maxMarks}` : '-'}
                      </TableCell>
                      <TableCell>{getSubmissionStatusBadge(submission)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => openGradeDialog(submission)}
                          >
                            Grade
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Students</CardTitle>
              <CardDescription>
                Students enrolled in your courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Submissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.semester}</TableCell>
                      <TableCell>{student.submissionCount || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription>{subject.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Semester:</strong> {subject.semester}</p>
                    <p><strong>Credits:</strong> {subject.credits}</p>
                    <p><strong>Assignments:</strong> {subject._count?.assignments || 0}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Grade and provide feedback for {selectedSubmission?.student?.name}'s submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Grade (out of {selectedSubmission?.assignment?.maxMarks})</label>
              <Input
                type="number"
                placeholder="Enter grade"
                value={gradeData.grade}
                onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
                max={selectedSubmission?.assignment?.maxMarks}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Feedback</label>
              <Textarea
                placeholder="Provide feedback to the student..."
                value={gradeData.feedback}
                onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGradeSubmission}>Submit Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 