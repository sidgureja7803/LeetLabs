"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { submissionsAPI, subjectsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Eye, FileText, CheckCircle, XCircle, Search } from 'lucide-react';
import { Submission, Subject } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function TeacherSubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: ''
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    const subjectId = searchParams.get('subjectId');
    if (subjectId) {
      setSubjectFilter(subjectId);
    }
    
    Promise.all([
      fetchSubmissions(),
      fetchSubjects()
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error('Error initializing page:', error);
      setLoading(false);
    });
  }, [searchParams]);

  const fetchSubmissions = async () => {
    try {
      const res = await submissionsAPI.getTeacherSubmissions();
      setSubmissions(res.data || []);
      return res.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
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

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      await submissionsAPI.gradeSubmission(
        selectedSubmission.id, 
        {
          grade: parseFloat(gradeData.grade),
          feedback: gradeData.feedback
        }
      );
      
      setGradeDialogOpen(false);
      fetchSubmissions();
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

  const filteredSubmissions = submissions.filter(sub => {
    // Filter by subject
    const matchesSubject = subjectFilter === 'all' || sub.assignment.subject.id === subjectFilter;
    
    // Filter by status
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'graded' && sub.grade !== null) || 
      (statusFilter === 'pending' && sub.grade === null);
    
    // Filter by search query
    const matchesSearch = 
      !searchQuery || 
      sub.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sub.student.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sub.assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSubject && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (submission: Submission) => {
    if (submission.grade !== null) {
      return (
        <Badge variant="success" className="flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" /> Graded
        </Badge>
      );
    } else {
      return (
        <Badge variant="warning" className="flex items-center">
          <FileText className="w-3 h-3 mr-1" /> Needs Grading
        </Badge>
      );
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
        <h2 className="text-3xl font-bold tracking-tight">Student Submissions</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Submissions</CardTitle>
          <CardDescription>Review and grade student submissions</CardDescription>
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
              <label className="text-sm font-medium mb-1 block">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="pending">Needs Grading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by student or assignment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-600">No submissions found</p>
              <p className="text-sm text-gray-500 mt-1">
                {submissions.length === 0
                  ? "There are no student submissions yet."
                  : "No submissions match your current filters."}
              </p>
              {submissions.length > 0 && (
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSubjectFilter('all');
                  setStatusFilter('all');
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
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.student.name}</div>
                        <div className="text-xs text-gray-500">{submission.student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{submission.assignment.title}</TableCell>
                    <TableCell>{submission.assignment.subject.name}</TableCell>
                    <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(submission)}</TableCell>
                    <TableCell>
                      {submission.grade !== null ? (
                        <span className="font-medium">
                          {submission.grade}/{submission.assignment.maxMarks}
                          <span className="text-xs ml-1 text-gray-500">
                            ({((submission.grade / submission.assignment.maxMarks) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" /> View
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant={submission.grade !== null ? "outline" : "default"}
                          onClick={() => openGradeDialog(submission)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> 
                          {submission.grade !== null ? "Update Grade" : "Grade"}
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

      {/* Grade Submission Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.grade !== null ? "Update Grade" : "Grade Submission"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <div className="text-sm">
                  <p><strong>Student:</strong> {selectedSubmission.student.name}</p>
                  <p><strong>Assignment:</strong> {selectedSubmission.assignment.title}</p>
                  <p><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Grade (out of {selectedSubmission?.assignment.maxMarks})</label>
              <Input
                type="number"
                min="0"
                max={selectedSubmission?.assignment.maxMarks}
                value={gradeData.grade}
                onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback</label>
              <Textarea
                placeholder="Provide feedback to the student"
                value={gradeData.feedback}
                onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleGradeSubmission}
              disabled={!gradeData.grade || isNaN(parseFloat(gradeData.grade))}
            >
              {selectedSubmission?.grade !== null ? "Update" : "Submit Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
