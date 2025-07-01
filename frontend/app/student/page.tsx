"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ClipboardCheck, TrendingUp, Calendar, Upload, Download, Eye } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [grades, setGrades] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, assignmentsRes, submissionsRes, gradesRes] = await Promise.all([
        api.getStudentDashboard(),
        api.getStudentAssignments(),
        api.getStudentSubmissions(),
        api.getStudentGrades()
      ]);
      
      setDashboardData(dashRes.data);
      setAssignments(assignmentsRes.data);
      setSubmissions(submissionsRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatusBadge = (assignment: any) => {
    const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (hasSubmission) {
      const submission = assignment.submissions[0];
      if (submission.grade !== null) {
        return <Badge variant="success">Graded</Badge>;
      } else {
        return <Badge variant="info">Submitted</Badge>;
      }
    } else if (dueDate < now) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge variant="warning">Pending</Badge>;
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return `Overdue by ${Math.abs(daysDiff)} days`;
    } else if (daysDiff === 0) {
      return 'Due today';
    } else if (daysDiff === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysDiff} days`;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
        <p className="text-sm text-gray-500">
          {dashboardData?.student.department} • Semester {dashboardData?.student.semester}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.totalAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.submittedAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed assignments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.averageGrade.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.pendingSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Due assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>
                View and submit your assignments across all subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.subject?.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDueDate(assignment.dueDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.maxMarks}</TableCell>
                      <TableCell>{getAssignmentStatusBadge(assignment)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(!assignment.submissions || assignment.submissions.length === 0) && (
                            <Button size="sm">
                              <Upload className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          )}
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
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>
                Track your submitted assignments and their grading status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.assignment?.title}</TableCell>
                      <TableCell>{submission.assignment?.subject?.name}</TableCell>
                      <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {submission.grade !== null ? (
                          <Badge variant="success">
                            {submission.grade}/{submission.assignment?.maxMarks}
                          </Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.feedback ? (
                          <span className="text-sm">{submission.feedback}</span>
                        ) : (
                          <span className="text-muted-foreground">No feedback yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Report</CardTitle>
              <CardDescription>
                Your academic performance across subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900">Overall Average</h3>
                  <p className="text-4xl font-bold text-thapar-blue mt-2">
                    {grades?.overallAverage?.toFixed(1) || 0}%
                  </p>
                  <p className="text-gray-600 mt-1">Based on {grades?.totalSubmissions || 0} graded assignments</p>
                </div>

                {grades?.subjectGrades?.map((subject: any) => (
                  <Card key={subject.subjectName}>
                    <CardHeader>
                      <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                      <CardDescription>Teacher: {subject.teacher}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Subject Average:</span>
                        <Badge variant={subject.average >= 70 ? 'success' : subject.average >= 50 ? 'warning' : 'destructive'}>
                          {subject.average.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {subject.grades.map((grade: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{grade.assignmentTitle}</span>
                            <span className="font-medium">
                              {grade.grade}/{grade.maxMarks} ({grade.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 