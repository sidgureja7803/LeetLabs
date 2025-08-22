"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart,
  Award
} from 'lucide-react';
import { studentAPI } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    student: {
      id: '',
      name: '',
      email: '',
      department: '',
      semester: 0,
      enrollmentNumber: '',
    },
    stats: {
      totalSubjects: 0,
      totalAssignments: 0,
      pendingAssignments: 0,
      totalQuizzes: 0,
      pendingQuizzes: 0,
      completedAssignments: 0,
      completedQuizzes: 0,
    },
    assignments: [],
    grades: [],
    quizzes: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await studentAPI.getDashboard();
        if (res.data) {
          setDashboardData(res.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to get badge color based on status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'GRADED':
        return <Badge className="bg-blue-500">Graded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Helper function for grade color
  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-emerald-600";
    if (grade >= 70) return "text-blue-600";
    if (grade >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function for grade label
  const getGradeLabel = (grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-blue-100 rounded-full p-6">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{dashboardData.student.name}</h3>
              <p className="text-gray-500">{dashboardData.student.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{dashboardData.student.department}</Badge>
                <Badge variant="secondary">Semester {dashboardData.student.semester}</Badge>
                <Badge>{dashboardData.student.enrollmentNumber}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Subjects
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalSubjects}</div>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/student/subjects">View Subjects</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assignments
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold">{dashboardData.stats.totalAssignments}</span>
                  <span className="text-sm text-yellow-600">
                    {dashboardData.stats.pendingAssignments} pending
                  </span>
                </div>
                <Progress 
                  value={(dashboardData.stats.completedAssignments / dashboardData.stats.totalAssignments) * 100 || 0}
                  className="h-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quizzes
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold">{dashboardData.stats.totalQuizzes}</span>
                  <span className="text-sm text-yellow-600">
                    {dashboardData.stats.pendingQuizzes} pending
                  </span>
                </div>
                <Progress 
                  value={(dashboardData.stats.completedQuizzes / dashboardData.stats.totalQuizzes) * 100 || 0}
                  className="h-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Grade Average
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {dashboardData.grades && dashboardData.grades.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {Math.round(dashboardData.grades.reduce((sum, grade) => sum + grade.score, 0) / dashboardData.grades.length)}%
                    </div>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link href="/student/grades">View Grades</Link>
                    </Button>
                  </>
                ) : (
                  <div className="text-muted-foreground">No grades yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
              <CardDescription>
                Your most recent assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.assignments && dashboardData.assignments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <div className="text-sm text-muted-foreground">
                          {assignment.subject.name} • Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(assignment.status)}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/student/assignments/${assignment.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No assignments yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View all your assignments here</p>
              <Button className="mt-4" asChild>
                <Link href="/student/assignments">Go to Assignments</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View all your submissions here</p>
              <Button className="mt-4" asChild>
                <Link href="/student/submissions">Go to Submissions</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View all your quizzes here</p>
              <Button className="mt-4" asChild>
                <Link href="/student/quizzes">Go to Quizzes</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Grade Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View your complete grade report here</p>
              <Button className="mt-4" asChild>
                <Link href="/student/grades">Go to Grades</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
