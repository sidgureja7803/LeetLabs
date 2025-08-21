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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Clock, FileText, Download, Upload, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    maxMarks: 100,
    file: null as File | null
  });
  const [gradeData, setGradeData] = useState({
    marks: '',
    feedback: ''
  });
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await assignmentsAPI.getTeacherAssignments();
      setAssignments(res.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.getTeacherSubjects();
      setSubjects(res.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const res = await assignmentsAPI.getAssignmentSubmissions(assignmentId);
      setSubmissions(res.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.subjectId || !newAssignment.dueDate) return;
    
    try {
      setCreating(true);
      const formData = new FormData();
      Object.entries(newAssignment).forEach(([key, value]) => {
        if (value !== null) {
          if (key === 'file' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      await assignmentsAPI.createAssignment(formData);
      setCreateDialogOpen(false);
      resetNewAssignmentForm();
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      await submissionsAPI.gradeSubmission(selectedSubmission.id, {
        marks: parseFloat(gradeData.marks),
        feedback: gradeData.feedback
      });
      setGradeDialogOpen(false);
      
      // Refresh submissions list if open
      if (submissionsDialogOpen && selectedAssignment) {
        fetchSubmissions(selectedAssignment.id);
      }
      
      // Refresh assignments to update stats
      fetchAssignments();
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await assignmentsAPI.deleteAssignment(assignmentId);
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const resetNewAssignmentForm = () => {
    setNewAssignment({
      title: '',
      description: '',
      subjectId: '',
      dueDate: '',
      maxMarks: 100,
      file: null
    });
  };

  const openSubmissionsDialog = (assignment: any) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment.id);
    setSubmissionsDialogOpen(true);
  };

  const openGradeDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeData({
      marks: submission.marks?.toString() || '',
      feedback: submission.feedback || ''
    });
    setGradeDialogOpen(true);
  };

  const openViewDialog = (assignment: any) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  const getAssignmentStatusBadge = (assignment: any) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (dueDate > now) {
      return <Badge variant="default">Active</Badge>;
    } else {
      return <Badge variant="secondary">Past Due</Badge>;
    }
  };

  const getSubmissionStatusBadge = (submission: any) => {
    if (submission.status === 'GRADED') {
      return <Badge variant="success">Graded</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Create and manage assignments for your students</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create a new assignment for your students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Assignment Title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
              />
              <Textarea
                placeholder="Assignment Description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
              />
              <Select value={newAssignment.subjectId} onValueChange={(value) => setNewAssignment({...newAssignment, subjectId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Marks</label>
                  <Input
                    type="number"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({...newAssignment, maxMarks: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Attachment (Optional)</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                  onChange={(e) => setNewAssignment({...newAssignment, file: e.target.files?.[0] || null})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, Word, PowerPoint, ZIP
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateAssignment} 
                disabled={!newAssignment.title || !newAssignment.subjectId || !newAssignment.dueDate || creating}
              >
                {creating ? 'Creating...' : 'Create Assignment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'active' ? 'border-b-2 border-thapar-blue text-thapar-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'past' ? 'border-b-2 border-thapar-blue text-thapar-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Due
        </button>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'active' ? 'Active Assignments' : 'Past Assignments'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'active' ? 'Assignments that are currently active' : 'Assignments that are past their due date'}
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
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments
                .filter(assignment => {
                  const dueDate = new Date(assignment.dueDate);
                  const now = new Date();
                  return activeTab === 'active' ? dueDate >= now : dueDate < now;
                })
                .map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.subject?.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(assignment.dueDate)}</span>
                        {activeTab === 'active' && (
                          <span className="text-xs text-orange-600 font-medium">
                            {formatTimeRemaining(assignment.dueDate)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.maxMarks}</TableCell>
                    <TableCell>
                      {assignment._count?.submissions || 0} / {assignment.totalStudents || '?'}
                    </TableCell>
                    <TableCell>{getAssignmentStatusBadge(assignment)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openViewDialog(assignment)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => openSubmissionsDialog(assignment)}
                        >
                          Submissions
                        </Button>
                        {activeTab === 'active' && (
                          <>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {assignments.filter(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const now = new Date();
                return activeTab === 'active' ? dueDate >= now : dueDate < now;
              }).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    No {activeTab} assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Assignment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              View assignment details
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
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Submission Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold">{selectedAssignment.totalStudents || '?'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Submissions</p>
                    <p className="text-2xl font-bold">{selectedAssignment._count?.submissions || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Graded</p>
                    <p className="text-2xl font-bold">{selectedAssignment.gradedCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              if (selectedAssignment) {
                openSubmissionsDialog(selectedAssignment);
              }
            }}>View Submissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog open={submissionsDialogOpen} onOpenChange={setSubmissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions</DialogTitle>
            <DialogDescription>
              View and grade student submissions for {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Due Date: {selectedAssignment ? formatDate(selectedAssignment.dueDate) : ''}</p>
                <p className="text-sm font-medium">Max Marks: {selectedAssignment?.maxMarks}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Total Submissions: {submissions.length}</p>
                <p className="text-sm font-medium">Pending: {submissions.filter(s => s.status !== 'GRADED').length}</p>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.student?.firstName} {submission.student?.lastName}
                      <div className="text-xs text-gray-500">{submission.student?.rollNumber || submission.student?.email}</div>
                    </TableCell>
                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell>
                      {submission.fileUrl ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            {submission.fileName || 'Download'}
                          </a>
                        </Button>
                      ) : (
                        'No file'
                      )}
                    </TableCell>
                    <TableCell>{getSubmissionStatusBadge(submission)}</TableCell>
                    <TableCell>
                      {submission.status === 'GRADED' ? (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{submission.marks}</span>
                          <span className="text-gray-500">/{selectedAssignment?.maxMarks}</span>
                        </div>
                      ) : (
                        'Not graded'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openGradeDialog(submission)}>
                        {submission.status === 'GRADED' ? 'Update Grade' : 'Grade'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No submissions yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setSubmissionsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Grade submission from {selectedSubmission?.student?.firstName} {selectedSubmission?.student?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assignment</label>
              <Input value={selectedAssignment?.title} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Submitted</label>
              <Input value={selectedSubmission ? formatDate(selectedSubmission.submittedAt) : ''} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Marks (out of {selectedAssignment?.maxMarks})</label>
              <Input
                type="number"
                value={gradeData.marks}
                onChange={(e) => setGradeData({...gradeData, marks: e.target.value})}
                max={selectedAssignment?.maxMarks}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Feedback (Optional)</label>
              <Textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                placeholder="Provide feedback to the student..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleGradeSubmission}
              disabled={!gradeData.marks}
            >
              Submit Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
