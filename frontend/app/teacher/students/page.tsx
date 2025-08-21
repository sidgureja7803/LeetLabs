"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { teacherAPI, subjectsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Search, User, FileText, Download, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Subject, User as UserType } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<UserType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<UserType[]>([]);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    const subjectId = searchParams.get('subjectId');
    if (subjectId) {
      setSubjectFilter(subjectId);
    }
    
    Promise.all([
      fetchStudents(),
      fetchSubjects()
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error('Error initializing page:', error);
      setLoading(false);
    });
  }, [searchParams]);

  const fetchStudents = async () => {
    try {
      const res = await teacherAPI.getStudents();
      setStudents(res.data || []);
      return res.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.getMySubjects();
      setSubjects(res.data || []);
      return res.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  };

  const handleSendEmail = async () => {
    if (selectedStudents.length === 0 || !emailData.subject || !emailData.message) return;

    try {
      // This is a placeholder - you would need to implement this API endpoint
      // await teacherAPI.sendBulkEmail({
      //   studentIds: selectedStudents.map(s => s.id),
      //   subject: emailData.subject,
      //   message: emailData.message
      // });
      
      setEmailDialogOpen(false);
      setEmailData({ subject: '', message: '' });
      setSelectedStudents([]);
      
      // Show success message
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const getUniqueSemesters = () => {
    const semesters = students.map(student => student.semester);
    return Array.from(new Set(semesters)).sort((a, b) => a - b);
  };

  const filteredStudents = students.filter(student => {
    // Filter by subject (if applicable)
    const matchesSubject = subjectFilter === 'all' || student.subjects?.some(s => s.id === subjectFilter);
    
    // Filter by semester
    const matchesSemester = semesterFilter === 'all' || student.semester === parseInt(semesterFilter);
    
    // Filter by search query
    const matchesSearch = 
      !searchQuery || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (student.rollNumber && student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSubject && matchesSemester && matchesSearch;
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
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <Button 
          onClick={() => {
            if (filteredStudents.length > 0) {
              setSelectedStudents(filteredStudents);
              setEmailDialogOpen(true);
            }
          }}
          disabled={filteredStudents.length === 0}
        >
          <Mail className="w-4 h-4 mr-2" /> Email Students
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>View and manage students in your subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Filter by Subject</label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Filter by Semester</label>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {getUniqueSemesters().map(semester => (
                    <SelectItem key={semester} value={semester.toString()}>Semester {semester}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-10">
              <User className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-600">No students found</p>
              <p className="text-sm text-gray-500 mt-1">
                {students.length === 0
                  ? "There are no students assigned to your subjects."
                  : "No students match your current filters."}
              </p>
              {students.length > 0 && (
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSubjectFilter('all');
                  setSemesterFilter('all');
                  setSearchQuery('');
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
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.rollNumber || '-'}</TableCell>
                    <TableCell>{student.semester}</TableCell>
                    <TableCell>
                      {student._count?.submissions || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/teacher/submissions?studentId=${student.id}`}>
                            <FileText className="w-4 h-4 mr-1" /> Submissions
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedStudents([student]);
                            setEmailDialogOpen(true);
                          }}
                        >
                          <Mail className="w-4 h-4 mr-1" /> Email
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

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to Students</DialogTitle>
            <DialogDescription>
              Sending email to {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipients</label>
              <div className="border rounded-md p-2 bg-gray-50 max-h-24 overflow-y-auto">
                {selectedStudents.map(student => (
                  <Badge key={student.id} className="mr-1 mb-1">
                    {student.name} ({student.email})
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Email subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Write your message here..."
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendEmail}
              disabled={!emailData.subject || !emailData.message}
            >
              <Send className="w-4 h-4 mr-2" /> Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
