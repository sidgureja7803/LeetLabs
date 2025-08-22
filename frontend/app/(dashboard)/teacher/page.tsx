"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, BookOpen, User, FileText, Calendar } from 'lucide-react';
import { teacherAPI } from '@/lib/api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    teacher: {
      id: '',
      name: '',
      email: '',
      department: ''
    },
    stats: {
      totalSubjects: 0,
      totalAssignments: 0,
      totalSubmissions: 0,
      pendingGrading: 0
    },
    subjects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await teacherAPI.getDashboard();
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
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
      </div>

      {/* Teacher Profile Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-blue-100 rounded-full p-6">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{dashboardData.teacher.name}</h3>
              <p className="text-gray-500">{dashboardData.teacher.email}</p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary">{dashboardData.teacher.department}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.pendingGrading}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Overview */}
      <Card>
        <CardHeader>
          <CardTitle>My Teaching Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.subjects.length === 0 ? (
            <p className="text-muted-foreground">No subjects assigned yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.subjects.map((subject: any) => (
                <Card key={subject.id} className="overflow-hidden border-none shadow-md">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                    <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                    <p className="text-blue-100 text-sm">{subject.code}</p>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span className="font-medium">{subject.department?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semester:</span>
                        <span className="font-medium">{subject.semester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assignments:</span>
                        <span className="font-medium">{subject.assignments?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
