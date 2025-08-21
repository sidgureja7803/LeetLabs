"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { assignmentsAPI, submissionsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, FileText, Download, Upload, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await assignmentsAPI.getStudentAssignments();
      setAssignments(res.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await submissionsAPI.getStudentSubmissions();
      setSubmissions(res.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submissionFile || !selectedAssignment) return;
    
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', submissionFile);
      if (submissionComment) {
        formData.append('comment', submissionComment);
      }
      
      await submissionsAPI.submitAssignment(selectedAssignment.id, formData);
      setSubmitDialogOpen(false);
      resetSubmissionForm();
      fetchAssignments();
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetSubmissionForm = () => {
    setSubmissionFile(null);
    setSubmissionComment('');
  };

  const openSubmitDialog = (assignment: any) => {
    setSelectedAssignment(assignment);
    setSubmitDialogOpen(true);
  };

  const openViewDialog = (assignment: any) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  const getAssignmentStatusBadge = (assignment: any) => {
    const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (hasSubmission) {
      const submission = assignment.submissions[0];
      if (submission.status === 'GRADED') {
        return <Badge variant="success">Graded</Badge>;
      } else {
        return <Badge variant="default">Submitted</Badge>;
      }
    } else if (dueDate < now) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge variant="warning">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeRemaining = (dueDate: string) => {
    if (!dueDate) return '';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    } else {
      return `${diffMinutes}m remaining`;
    }
  };

  const canSubmitAssignment = (assignment: any) => {
    const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    return !hasSubmission && now <= dueDate;
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(s => s.assignment?.id === assignmentId);
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
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">View and submit your assignments</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-thapar-blue text-thapar-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'submitted' ? 'border-b-2 border-thapar-blue text-thapar-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('submitted')}
        >
          Submitted
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'graded' ? 'border-b-2 border-thapar-blue text-thapar-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('graded')}
        >
          Graded
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'overdue' ? 'border-b-2 border-thapar-blue text-thapar-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue
        </button>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'pending' && 'Pending Assignments'}
            {activeTab === 'submitted' && 'Submitted Assignments'}
            {activeTab === 'graded' && 'Graded Assignments'}
            {activeTab === 'overdue' && 'Overdue Assignments'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'pending' && 'Assignments that need to be submitted'}
            {activeTab === 'submitted' && 'Assignments you have already submitted'}
            {activeTab === 'graded' && 'Assignments that have been graded'}
            {activeTab === 'overdue' && 'Assignments past their due date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments
                .filter(assignment => {
                  const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
                  const dueDate = new Date(assignment.dueDate);
                  const now = new Date();
                  
                  if (activeTab === 'pending') {
                    return !hasSubmission && now <= dueDate;
                  } else if (activeTab === 'submitted') {
                    return hasSubmission && assignment.submissions[0].status === 'SUBMITTED';
                  } else if (activeTab === 'graded') {
                    return hasSubmission && assignment.submissions[0].status === 'GRADED';
                  } else if (activeTab === 'overdue') {
                    return !hasSubmission && now > dueDate;
                  }
                  return false;
                })
                .map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.subject?.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(assignment.dueDate)}</span>
                        {canSubmitAssignment(assignment) && (
                          <span className="text-xs text-orange-600 font-medium">
                            {formatTimeRemaining(assignment.dueDate)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.maxMarks}</TableCell>
                    <TableCell>{getAssignmentStatusBadge(assignment)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openViewDialog(assignment)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {assignment.fileUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {canSubmitAssignment(assignment) && (
                          <Button size="sm" onClick={() => openSubmitDialog(assignment)}>
                            <Upload className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {assignments.filter(assignment => {
                const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
                const dueDate = new Date(assignment.dueDate);
                const now = new Date();
                
                if (activeTab === 'pending') {
                  return !hasSubmission && now <= dueDate;
                } else if (activeTab === 'submitted') {
                  return hasSubmission && assignment.submissions[0].status === 'SUBMITTED';
                } else if (activeTab === 'graded') {
                  return hasSubmission && assignment.submissions[0].status === 'GRADED';
                } else if (activeTab === 'overdue') {
                  return !hasSubmission && now > dueDate;
                }
                return false;
              }).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No {activeTab} assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Submit Assignment Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Upload your solution for {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assignment</label>
              <Input value={selectedAssignment?.title} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input value={selectedAssignment ? formatDate(selectedAssignment.dueDate) : ''} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Upload File</label>
              <Input
                type="file"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.zip,.rar,.7z,.txt,.c,.cpp,.java,.py,.js,.html,.css"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, Word, ZIP, RAR, 7Z, TXT, code files
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Comment (Optional)</label>
              <Textarea
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
                placeholder="Add any comments about your submission..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitAssignment} 
              disabled={!submissionFile || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              View assignment details and your submission
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{selectedAssignment.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {formatDate(selectedAssignment.dueDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>Subject: {selectedAssignment.subject?.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Max Marks: {selectedAssignment.maxMarks}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-line">{selectedAssignment.description}</p>
              </div>
              
              {selectedAssignment.fileUrl && (
                <div>
                  <h4 className="font-medium mb-2">Assignment File</h4>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={selectedAssignment.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Download {selectedAssignment.fileName || 'Assignment File'}
                    </a>
                  </Button>
                </div>
              )}
              
              {/* Submission section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Your Submission</h4>
                {getSubmissionForAssignment(selectedAssignment.id) ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Upload className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            Submitted on {formatDate(getSubmissionForAssignment(selectedAssignment.id)?.submittedAt)}
                          </span>
                        </div>
                        <Badge variant={
                          getSubmissionForAssignment(selectedAssignment.id)?.status === 'GRADED' ? 'success' : 'default'
                        }>
                          {getSubmissionForAssignment(selectedAssignment.id)?.status}
                        </Badge>
                      </div>
                      
                      {getSubmissionForAssignment(selectedAssignment.id)?.fileName && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild className="w-full justify-start">
                            <a href={getSubmissionForAssignment(selectedAssignment.id)?.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              {getSubmissionForAssignment(selectedAssignment.id)?.fileName}
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {getSubmissionForAssignment(selectedAssignment.id)?.comment && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">Your comment:</p>
                          <p className="text-sm mt-1">{getSubmissionForAssignment(selectedAssignment.id)?.comment}</p>
                        </div>
                      )}
                    </div>
                    
                    {getSubmissionForAssignment(selectedAssignment.id)?.status === 'GRADED' && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium mb-2">Grading</h5>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-lg font-bold">
                            {getSubmissionForAssignment(selectedAssignment.id)?.marks} / {selectedAssignment.maxMarks}
                          </span>
                          <Badge variant={
                            (getSubmissionForAssignment(selectedAssignment.id)?.marks / selectedAssignment.maxMarks) >= 0.7 ? 'success' : 
                            (getSubmissionForAssignment(selectedAssignment.id)?.marks / selectedAssignment.maxMarks) >= 0.4 ? 'default' : 
                            'destructive'
                          }>
                            {Math.round((getSubmissionForAssignment(selectedAssignment.id)?.marks / selectedAssignment.maxMarks) * 100)}%
                          </Badge>
                        </div>
                        
                        {getSubmissionForAssignment(selectedAssignment.id)?.feedback && (
                          <div>
                            <p className="text-xs text-gray-500">Feedback:</p>
                            <p className="text-sm mt-1 p-2 bg-white rounded border">
                              {getSubmissionForAssignment(selectedAssignment.id)?.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-lg">
                    <AlertTriangle className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No submission yet</p>
                    {canSubmitAssignment(selectedAssignment) ? (
                      <Button className="mt-4" onClick={() => {
                        setViewDialogOpen(false);
                        openSubmitDialog(selectedAssignment);
                      }}>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Now
                      </Button>
                    ) : (
                      <p className="mt-2 text-red-500 text-sm">Assignment is past due date</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
