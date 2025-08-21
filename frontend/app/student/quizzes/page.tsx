"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { quizAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuizInterface } from '@/components/ui/quiz-interface';
import { Calendar, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StudentQuizzesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizAttempt, setQuizAttempt] = useState<any>(null);
  const [attemptDialogOpen, setAttemptDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedQuizResults, setSelectedQuizResults] = useState<any>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await quizAPI.getStudentQuizzes();
      setQuizzes(res.data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      const res = await quizAPI.startQuizAttempt(quizId);
      setQuizAttempt(res.data);
      setAttemptDialogOpen(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string, answer: string) => {
    try {
      await quizAPI.submitQuizAnswer(quizAttempt.id, questionId, answer);
      return true;
    } catch (error) {
      console.error('Error submitting answer:', error);
      return false;
    }
  };

  const handleSubmitQuiz = async (answers: any[]) => {
    try {
      await quizAPI.submitQuizAttempt(quizAttempt.id);
      setAttemptDialogOpen(false);
      fetchQuizzes();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleViewResults = async (quizId: string) => {
    try {
      const res = await quizAPI.getQuizResults(quizId);
      setSelectedQuizResults(res.data);
      setResultsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    }
  };

  const getQuizStatusBadge = (quiz: any) => {
    if (quiz.hasCompleted) {
      return <Badge variant="success">Completed</Badge>;
    }
    
    const now = new Date();
    const scheduledFor = new Date(quiz.scheduledFor);
    const dueDate = new Date(quiz.dueDate);
    
    if (now < scheduledFor) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (now >= scheduledFor && now <= dueDate) {
      return <Badge variant="default">Available</Badge>;
    } else {
      return <Badge variant="destructive">Missed</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
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

  const canAttemptQuiz = (quiz: any) => {
    if (quiz.hasCompleted) return false;
    
    const now = new Date();
    const scheduledFor = new Date(quiz.scheduledFor);
    const dueDate = new Date(quiz.dueDate);
    
    return now >= scheduledFor && now <= dueDate;
  };

  if (loading && !attemptDialogOpen) {
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
        <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
        <p className="text-gray-600">View and attempt your quizzes</p>
      </div>

      {/* Upcoming Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Quizzes</CardTitle>
          <CardDescription>
            Quizzes that will be available in the future
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Available From</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes
                .filter(quiz => {
                  const now = new Date();
                  const scheduledFor = new Date(quiz.scheduledFor);
                  return now < scheduledFor;
                })
                .map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.subject?.name}</TableCell>
                    <TableCell>{formatDate(quiz.scheduledFor)}</TableCell>
                    <TableCell>{formatDate(quiz.dueDate)}</TableCell>
                    <TableCell>{quiz.duration} mins</TableCell>
                    <TableCell>{getQuizStatusBadge(quiz)}</TableCell>
                  </TableRow>
                ))}
              {quizzes.filter(quiz => {
                const now = new Date();
                const scheduledFor = new Date(quiz.scheduledFor);
                return now < scheduledFor;
              }).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No upcoming quizzes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Available Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Available Quizzes</CardTitle>
          <CardDescription>
            Quizzes that you can attempt now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Time Remaining</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes
                .filter(quiz => {
                  if (quiz.hasCompleted) return false;
                  const now = new Date();
                  const scheduledFor = new Date(quiz.scheduledFor);
                  const dueDate = new Date(quiz.dueDate);
                  return now >= scheduledFor && now <= dueDate;
                })
                .map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.subject?.name}</TableCell>
                    <TableCell>{formatDate(quiz.dueDate)}</TableCell>
                    <TableCell>{quiz.duration} mins</TableCell>
                    <TableCell className="text-orange-600 font-medium">
                      {formatTimeRemaining(quiz.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleStartQuiz(quiz.id)}>
                        Start Quiz
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {quizzes.filter(quiz => {
                if (quiz.hasCompleted) return false;
                const now = new Date();
                const scheduledFor = new Date(quiz.scheduledFor);
                const dueDate = new Date(quiz.dueDate);
                return now >= scheduledFor && now <= dueDate;
              }).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No available quizzes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Completed Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Quizzes</CardTitle>
          <CardDescription>
            Quizzes you have already attempted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Completed On</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes
                .filter(quiz => quiz.hasCompleted)
                .map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.subject?.name}</TableCell>
                    <TableCell>{formatDate(quiz.completedAt)}</TableCell>
                    <TableCell>
                      {quiz.score !== undefined ? (
                        <span className="font-medium">
                          {quiz.score}/{quiz.totalMarks} ({Math.round((quiz.score / quiz.totalMarks) * 100)}%)
                        </span>
                      ) : (
                        'Not graded'
                      )}
                    </TableCell>
                    <TableCell>
                      {quiz.score !== undefined && (
                        <Badge variant={quiz.score / quiz.totalMarks >= 0.7 ? 'success' : quiz.score / quiz.totalMarks >= 0.4 ? 'default' : 'destructive'}>
                          {quiz.score / quiz.totalMarks >= 0.9 ? 'A' : 
                           quiz.score / quiz.totalMarks >= 0.8 ? 'B' : 
                           quiz.score / quiz.totalMarks >= 0.7 ? 'C' : 
                           quiz.score / quiz.totalMarks >= 0.6 ? 'D' : 
                           quiz.score / quiz.totalMarks >= 0.4 ? 'E' : 'F'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" onClick={() => handleViewResults(quiz.id)}>
                        View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {quizzes.filter(quiz => quiz.hasCompleted).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No completed quizzes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quiz Attempt Dialog */}
      <Dialog open={attemptDialogOpen} onOpenChange={(open) => {
        if (!open && !confirm('Are you sure you want to exit the quiz? Your progress will be saved.')) {
          return;
        }
        setAttemptDialogOpen(open);
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {quizAttempt && (
            <QuizInterface
              attempt={quizAttempt}
              onSubmit={handleSubmitQuiz}
              onSubmitAnswer={handleSubmitAnswer}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
            <DialogDescription>
              Your performance on this quiz
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuizResults && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quiz</p>
                    <p className="font-medium">{selectedQuizResults.quiz.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="font-medium">{selectedQuizResults.quiz.subject.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed On</p>
                    <p className="font-medium">{formatDate(selectedQuizResults.completedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Taken</p>
                    <p className="font-medium">{selectedQuizResults.timeTaken} minutes</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900">Your Score</h3>
                <p className="text-4xl font-bold text-thapar-blue mt-2">
                  {selectedQuizResults.score}/{selectedQuizResults.quiz.totalMarks} 
                  <span className="text-xl ml-2">
                    ({Math.round((selectedQuizResults.score / selectedQuizResults.quiz.totalMarks) * 100)}%)
                  </span>
                </p>
                <div className="mt-4 flex justify-center">
                  <Badge className="text-lg px-4 py-1" variant={
                    selectedQuizResults.score / selectedQuizResults.quiz.totalMarks >= 0.7 ? 'success' : 
                    selectedQuizResults.score / selectedQuizResults.quiz.totalMarks >= 0.4 ? 'default' : 
                    'destructive'
                  }>
                    Grade: {
                      selectedQuizResults.score / selectedQuizResults.quiz.totalMarks >= 0.9 ? 'A' : 
                      selectedQuizResults.score / selectedQuizResults.quiz.totalMarks >= 0.8 ? 'B' : 
                      selectedQuizResults.score / selectedQuizResults.quiz.totalMarks >= 0.7 ? 'C' : 
                      selectedQuizResults.score / selectedQuizResults.quiz.totalMarks >= 0.6 ? 'D' : 
                      selectedQuizResults.score / selectedQuizResults.quiz.totalMarks >= 0.4 ? 'E' : 'F'
                    }
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Question Breakdown</h3>
                {selectedQuizResults.answers.map((answer: any, index: number) => (
                  <Card key={answer.questionId}>
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Question {index + 1}</span>
                          <Badge variant="outline">{answer.question.marks} marks</Badge>
                        </div>
                        {answer.isCorrect ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span>Incorrect</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="py-3 space-y-3">
                      <p className="font-medium">{answer.question.question}</p>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Your Answer:</p>
                        <div className="p-2 bg-gray-50 rounded border">
                          {answer.answer || <span className="text-gray-400">No answer provided</span>}
                        </div>
                      </div>
                      
                      {answer.question.type !== 'ESSAY' && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Correct Answer:</p>
                          <div className="p-2 bg-gray-50 rounded border">
                            {answer.question.correctAnswer}
                          </div>
                        </div>
                      )}
                      
                      {answer.feedback && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Feedback:</p>
                          <div className="p-2 bg-gray-50 rounded border">
                            {answer.feedback}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setResultsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
