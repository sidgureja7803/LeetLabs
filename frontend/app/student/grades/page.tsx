"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { studentAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GradeData {
  overallAverage: number;
  subjectGrades: SubjectGrade[];
  totalSubmissions: number;
}

interface SubjectGrade {
  subjectName: string;
  teacher: string;
  grades: AssignmentGrade[];
  totalMarks: number;
  obtainedMarks: number;
  average: number;
}

interface AssignmentGrade {
  assignmentTitle: string;
  grade: number;
  maxMarks: number;
  percentage: number;
  gradedAt: string;
}

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await studentAPI.getGrades();
      setGradeData(res.data || { overallAverage: 0, subjectGrades: [], totalSubmissions: 0 });
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
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
        <h2 className="text-3xl font-bold tracking-tight">My Grades</h2>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Overall Grade Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Overall Performance</CardTitle>
          <CardDescription>Your cumulative grade across all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">Overall Average</div>
              <div className={`text-4xl font-bold ${getGradeColor(gradeData?.overallAverage || 0)}`}>
                {gradeData?.overallAverage?.toFixed(2)}%
              </div>
              <div className="text-lg font-semibold mt-1">
                {getGradeLabel(gradeData?.overallAverage || 0)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">Total Subjects</div>
              <div className="text-4xl font-bold text-blue-600">
                {gradeData?.subjectGrades?.length || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">With Grades</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">Graded Submissions</div>
              <div className="text-4xl font-bold text-purple-600">
                {gradeData?.totalSubmissions || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Assignments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Grades */}
      {gradeData?.subjectGrades && gradeData.subjectGrades.length > 0 ? (
        gradeData.subjectGrades.map((subject, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" /> {subject.subjectName}
                  </CardTitle>
                  <CardDescription>Taught by {subject.teacher}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Subject Average</div>
                  <div className={`text-2xl font-bold ${getGradeColor(subject.average)}`}>
                    {subject.average.toFixed(2)}%
                    <span className="text-sm ml-2">({getGradeLabel(subject.average)})</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                    <TableHead className="text-right">Max Marks</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                    <TableHead>Date Graded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subject.grades.map((assignment, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{assignment.assignmentTitle}</TableCell>
                      <TableCell className="text-right">{assignment.grade}</TableCell>
                      <TableCell className="text-right">{assignment.maxMarks}</TableCell>
                      <TableCell className={`text-right font-medium ${getGradeColor(assignment.percentage)}`}>
                        {assignment.percentage.toFixed(2)}%
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getGradeColor(assignment.percentage)}`}>
                        {getGradeLabel(assignment.percentage)}
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.gradedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-right">
                <span className="text-sm text-gray-500">Total: </span>
                <span className="font-medium">{subject.obtainedMarks}/{subject.totalMarks} marks</span>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No grades available yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Grades will appear here once your assignments and quizzes are graded.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
