"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { subjectsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, FileText, Calendar, Plus, Upload, Download } from 'lucide-react';
import { Subject } from '@/lib/types';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TeacherSubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialDescription, setMaterialDescription] = useState('');

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

  const handleUploadMaterial = async () => {
    if (!selectedSubject || !materialFile) return;

    try {
      const formData = new FormData();
      formData.append('file', materialFile);
      formData.append('description', materialDescription);
      formData.append('subjectId', selectedSubject.id);

      // This is a placeholder - you would need to implement this API endpoint
      // await subjectsAPI.uploadMaterial(formData);
      
      setUploadDialogOpen(false);
      setMaterialFile(null);
      setMaterialDescription('');
      setSelectedSubject(null);
      
      // Refresh subjects data
      fetchSubjects();
    } catch (error) {
      console.error('Error uploading material:', error);
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
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" /> Upload Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Subject Material</DialogTitle>
              <DialogDescription>
                Upload lecture notes, presentations, or other materials for your students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Subject</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedSubject?.id || ''}
                  onChange={(e) => {
                    const selected = subjects.find(s => s.id === e.target.value);
                    setSelectedSubject(selected || null);
                  }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief description of the material"
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">File</label>
                <Input
                  type="file"
                  onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, ZIP
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUploadMaterial}
                disabled={!selectedSubject || !materialFile}
              >
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <p className="text-muted-foreground">No subjects assigned to you.</p>
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
                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">Department:</span>
                        <span className="ml-2 text-gray-600">{subject.department?.name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">Students:</span>
                        <span className="ml-2 text-gray-600">~{subject._count?.students || 0}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">Assignments:</span>
                        <span className="ml-2 text-gray-600">{subject._count?.assignments || 0}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/assignments?subjectId=${subject.id}`}>
                          Assignments
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/quizzes?subjectId=${subject.id}`}>
                          Quizzes
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/students?subjectId=${subject.id}`}>
                          Students
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedSubject(subject);
                          setUploadDialogOpen(true);
                        }}
                      >
                        <Upload className="w-3 h-3 mr-1" /> Materials
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
              <CardDescription>Subjects you're teaching this semester</CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.filter(s => s.isCurrentSemester).length === 0 ? (
                <p className="text-muted-foreground">No subjects assigned for current semester.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects
                      .filter(s => s.isCurrentSemester)
                      .map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>{subject.code}</TableCell>
                          <TableCell>{subject.credits}</TableCell>
                          <TableCell>{subject.department?.name}</TableCell>
                          <TableCell>{subject._count?.students || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/teacher/assignments?subjectId=${subject.id}`}>
                                  Assignments
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/teacher/quizzes?subjectId=${subject.id}`}>
                                  Quizzes
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/teacher/students?subjectId=${subject.id}`}>
                                  Students
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
