"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Create a mock Progress component if not available
const Progress = ({ value, className }: { value: number, className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full ${className || ''}`}>
    <div 
      className="bg-blue-600 rounded-full h-full transition-all duration-500" 
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
);
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
// Mock studentAPI since it's not exported from @/lib/api
const studentAPI = {
  getDashboard: () => Promise.resolve({ data: null })
};

export default function StudentDashboard() {
  const { user } = useAuth();
  // Define types for our dashboard data
  type Subject = {
    id: string;
    name: string;
    code: string;
    instructor: string;
    progress: number;
  };
  
  type Assignment = {
    id: string;
    title: string;
    status: string;
    dueDate: string;
    subject: { name: string };
  };
  
  type Quiz = {
    id: string;
    title: string;
    status: string;
    dueDate: string;
    subject: { name: string };
  };
  
  type Grade = {
    id: string;
    subject: { name: string };
    score: number;
    maxScore: number;
    assignment: string;
  };
  
  type DashboardData = {
    student: {
      id: string;
      name: string;
      email: string;
      department: string;
      semester: number;
      enrollmentNumber: string;
    };
    stats: {
      totalSubjects: number;
      totalAssignments: number;
      pendingAssignments: number;
      totalQuizzes: number;
      pendingQuizzes: number;
      completedAssignments: number;
      completedQuizzes: number;
    };
    assignments: Assignment[];
    quizzes: Quiz[];
    grades: Grade[];
    subjects: Subject[];
  };

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    student: {
      id: '',
      name: '',
      email: '',
      department: '',
      semester: 0,
      enrollmentNumber: ''
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
    quizzes: [],
    subjects: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Mock dashboard data with requested details
    const mockDashboardData: DashboardData = {
      student: {
        id: '1',
        name: 'Siddhant Gureja',
        email: 'siddhant.gureja@thapar.edu',
        department: 'Computer Science',
        semester: 3,
        enrollmentNumber: '102215071',
      },
      stats: {
        totalSubjects: 5,
        totalAssignments: 8,
        pendingAssignments: 3,
        totalQuizzes: 5,
        pendingQuizzes: 2,
        completedAssignments: 5,
        completedQuizzes: 3,
      },
      assignments: [
        {
          id: '1',
          title: 'Process Scheduling Implementation',
          status: 'PENDING',
          dueDate: new Date(2025, 8, 30).toISOString(),
          subject: { name: 'Operating Systems' }
        },
        {
          id: '2',
          title: 'Newton-Raphson Method Analysis',
          status: 'COMPLETED',
          dueDate: new Date(2025, 8, 20).toISOString(),
          subject: { name: 'Numerical Analysis' }
        },
        {
          id: '3',
          title: 'AVL Trees Implementation',
          status: 'GRADED',
          dueDate: new Date(2025, 8, 15).toISOString(),
          subject: { name: 'Data Structures and Algorithms' }
        },
        {
          id: '4',
          title: 'Material Properties Analysis',
          status: 'PENDING',
          dueDate: new Date(2025, 8, 28).toISOString(),
          subject: { name: 'Engineering Materials' }
        },
        {
          id: '5',
          title: 'Graph Theory Proofs',
          status: 'OVERDUE',
          dueDate: new Date(2025, 8, 10).toISOString(),
          subject: { name: 'Discrete Mathematics' }
        }
      ],
      quizzes: [
        {
          id: '1',
          title: 'Memory Management Quiz',
          status: 'PENDING',
          dueDate: new Date(2025, 9, 5).toISOString(),
          subject: { name: 'Operating Systems' }
        },
        {
          id: '2',
          title: 'Integration Methods Quiz',
          status: 'COMPLETED',
          dueDate: new Date(2025, 8, 25).toISOString(),
          subject: { name: 'Numerical Analysis' }
        },
        {
          id: '3',
          title: 'Sorting Algorithms Quiz',
          status: 'COMPLETED',
          dueDate: new Date(2025, 8, 18).toISOString(),
          subject: { name: 'Data Structures and Algorithms' }
        },
      ],
      grades: [
        {
          id: '1',
          subject: { name: 'Operating Systems' },
          score: 85,
          maxScore: 100,
          assignment: 'Mid-Term Exam'
        },
        {
          id: '2',
          subject: { name: 'Numerical Analysis' },
          score: 92,
          maxScore: 100,
          assignment: 'Quiz 1'
        },
        {
          id: '3',
          subject: { name: 'Data Structures and Algorithms' },
          score: 88,
          maxScore: 100,
          assignment: 'Programming Assignment 1'
        },
        {
          id: '4',
          subject: { name: 'Engineering Materials' },
          score: 78,
          maxScore: 100,
          assignment: 'Lab Report'
        },
        {
          id: '5',
          subject: { name: 'Discrete Mathematics' },
          score: 90,
          maxScore: 100,
          assignment: 'Problem Set 1'
        },
      ],
      subjects: [
        {
          id: '1',
          name: 'Operating Systems',
          code: 'CS301',
          instructor: 'Dr. Rajeev Kumar',
          progress: 65
        },
        {
          id: '2',
          name: 'Numerical Analysis',
          code: 'MA301',
          instructor: 'Dr. Anita Sharma',
          progress: 75
        },
        {
          id: '3',
          name: 'Data Structures and Algorithms',
          code: 'CS302',
          instructor: 'Prof. Amit Singh',
          progress: 80
        },
        {
          id: '4',
          name: 'Engineering Materials',
          code: 'ME201',
          instructor: 'Dr. Pradeep Gupta',
          progress: 60
        },
        {
          id: '5',
          name: 'Discrete Mathematics',
          code: 'MA302',
          instructor: 'Prof. Ritu Verma',
          progress: 70
        }
      ]
    };
    
    // Set mock data instead of fetching from API
    setDashboardData(mockDashboardData);
    setLoading(false);
    
    // Commented out original API call for future reference
    /*
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
    */
  }, []);

  // Helper function to get badge color based on status
  const getStatusBadge = (status: string) => {
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
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  // Helper function for grade color
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-emerald-600";
    if (grade >= 70) return "text-blue-600";
    if (grade >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function for grade label
  const getGradeLabel = (grade: number) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
  };

  const getProgressColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-500';
    if (grade >= 75) return 'bg-blue-500';
    if (grade >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getProgressLabel = (grade: number) => {
    if (grade >= 90) return 'Excellent';
    if (grade >= 75) return 'Good';
    if (grade >= 60) return 'Average';
    return 'Needs Improvement';
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
