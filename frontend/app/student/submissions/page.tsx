"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { submissionsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Submission } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function StudentSubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const searchParams = useSearchParams();

  useEffect(() => {
    const subjectId = searchParams.get('subjectId');
    if (subjectId) {
      setSubjectFilter(subjectId);
    }
    fetchSubmissions();
  }, [searchParams]);

  const fetchSubmissions = async () => {
    try {
      const res = await submissionsAPI.getStudentSubmissions();
      setSubmissions(res.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueSubjects = () => {
    const subjects = submissions.map(sub => ({
      id: sub.assignment.subject.id,
      name: sub.assignment.subject.name
    }));
    return Array.from(new Map(subjects.map(item => [item.id, item])).values());
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSubject = subjectFilter === 'all' || sub.assignment.subject.id === subjectFilter;
    
    if (statusFilter === 'all') {
      return matchesSubject;
    } else if (statusFilter === 'graded') {
      return matchesSubject && sub.grade !== null;
    } else if (statusFilter === 'pending') {
      return matchesSubject && sub.grade === null;
    }
    
    return matchesSubject;
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
        <Badge variant="secondary" className="flex items-center">
          <FileText className="w-3 h-3 mr-1" /> Submitted
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
        <h2 className="text-3xl font-bold tracking-tight">My Submissions</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>View all your assignment and quiz submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-1/3">
              <label className="text-sm font-medium mb-1 block">Filter by Subject</label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {getUniqueSubjects().map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/3">
              <label className="text-sm font-medium mb-1 block">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="pending">Pending Grading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-600">No submissions found</p>
              <p className="text-sm text-gray-500 mt-1">
                {submissions.length === 0
                  ? "You haven't submitted any assignments yet."
                  : "No submissions match your current filters."}
              </p>
              {submissions.length > 0 && (
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSubjectFilter('all');
                  setStatusFilter('all');
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell className="font-medium">{submission.assignment.title}</TableCell>
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
                        <span className="text-gray-500">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" /> View
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/student/assignments/${submission.assignment.id}`}>
                            <Eye className="w-4 h-4 mr-1" /> Details
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
    </div>
  );
}
