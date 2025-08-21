"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { subjectsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, User, FileText, Calendar } from 'lucide-react';
import { Subject } from '@/lib/types';
import Link from 'next/link';

export default function StudentSubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.getMySubjects();
      setSubjects(res.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Subjects</h2>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Subjects</TabsTrigger>
          <TabsTrigger value="current">Current Semester</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {subjects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No subjects found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card key={subject.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold">{subject.name}</CardTitle>
                        <CardDescription className="text-blue-100 mt-1">
                          {subject.code} • {subject.credits} Credits
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-blue-800">
                        Semester {subject.semester}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">Teacher:</span>
                        <span className="ml-2 text-gray-600">{subject.teacher?.name || 'Not Assigned'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">Department:</span>
                        <span className="ml-2 text-gray-600">{subject.department?.name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">Assignments:</span>
                        <span className="ml-2 text-gray-600">{subject._count?.assignments || 0}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/student/assignments?subjectId=${subject.id}`}>
                          Assignments
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/student/quizzes?subjectId=${subject.id}`}>
                          Quizzes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Semester Subjects</CardTitle>
              <CardDescription>Subjects for your current semester</CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.filter(s => s.semester === user?.semester).length === 0 ? (
                <p className="text-muted-foreground">No subjects found for current semester.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects
                      .filter(s => s.semester === user?.semester)
                      .map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>{subject.code}</TableCell>
                          <TableCell>{subject.credits}</TableCell>
                          <TableCell>{subject.teacher?.name || 'Not Assigned'}</TableCell>
                          <TableCell>{subject.department?.name}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/student/assignments?subjectId=${subject.id}`}>
                                  Assignments
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/student/quizzes?subjectId=${subject.id}`}>
                                  Quizzes
                                </Link>
                              </Button>
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
