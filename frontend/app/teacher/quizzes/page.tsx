"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { quizAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Clock, Edit, Eye, Trash2, Upload, FileText } from 'lucide-react';

export default function TeacherQuizzesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [extractQuestionsDialogOpen, setExtractQuestionsDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    instructions: '',
    subjectId: '',
    totalMarks: 100,
    timeLimit: true,
    duration: 60, // minutes
    questions: [] as any[]
  });
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [scheduleData, setScheduleData] = useState({
    quizId: '',
    scheduledFor: '',
    dueDate: '',
    notifyStudents: true
  });
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchQuizzes();
    fetchSubjects();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await quizAPI.getTeacherQuizzes();
      setQuizzes(res.data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // This still uses the general API since it's not quiz-specific
      const res = await api.getTeacherSubjects();
      setSubjects(res.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      await quizAPI.createQuiz(newQuiz);
      setCreateDialogOpen(false);
      resetNewQuizForm();
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleExtractQuestions = async () => {
    if (!questionFile) return;

    try {
      const formData = new FormData();
      formData.append('file', questionFile);
      
      const res = await quizAPI.extractQuestionsFromFile(formData);
      setExtractedQuestions(res.data || []);
      
      // Add extracted questions to the new quiz
      setNewQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, ...res.data]
      }));
      
      setExtractQuestionsDialogOpen(false);
    } catch (error) {
      console.error('Error extracting questions:', error);
    }
  };

  const handleScheduleQuiz = async () => {
    try {
      await quizAPI.scheduleQuiz(scheduleData);
      setScheduleDialogOpen(false);
      fetchQuizzes();
    } catch (error) {
      console.error('Error scheduling quiz:', error);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await quizAPI.deleteQuiz(quizId);
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const resetNewQuizForm = () => {
    setNewQuiz({
      title: '',
      description: '',
      instructions: '',
      subjectId: '',
      totalMarks: 100,
      timeLimit: true,
      duration: 60,
      questions: []
    });
  };

  const openScheduleDialog = (quiz: any) => {
    setSelectedQuiz(quiz);
    setScheduleData({
      quizId: quiz.id,
      scheduledFor: '',
      dueDate: '',
      notifyStudents: true
    });
    setScheduleDialogOpen(true);
  };

  const getQuizStatusBadge = (quiz: any) => {
    if (!quiz.isPublished) {
      return <Badge variant="outline">Draft</Badge>;
    }
    
    const now = new Date();
    const scheduledFor = new Date(quiz.scheduledFor);
    const dueDate = new Date(quiz.dueDate);
    
    if (scheduledFor > now) {
      return <Badge variant="secondary">Scheduled</Badge>;
    } else if (now >= scheduledFor && now <= dueDate) {
      return <Badge variant="default">Active</Badge>;
    } else {
      return <Badge variant="outline">Completed</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: `temp-${Date.now()}`,
        question: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 5
      }]
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setNewQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const removeQuestion = (index: number) => {
    setNewQuiz(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-600">Create, manage and schedule quizzes for your students</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>
                Create a new quiz for your students. You can add questions manually or extract them from uploaded documents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <Input
                placeholder="Quiz Title"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
              />
              <Textarea
                placeholder="Quiz Description"
                value={newQuiz.description}
                onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
              />
              <Textarea
                placeholder="Instructions for students"
                value={newQuiz.instructions}
                onChange={(e) => setNewQuiz({...newQuiz, instructions: e.target.value})}
              />
              <Select value={newQuiz.subjectId} onValueChange={(value) => setNewQuiz({...newQuiz, subjectId: value})}>
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
                  <label className="text-sm font-medium">Total Marks</label>
                  <Input
                    type="number"
                    value={newQuiz.totalMarks}
                    onChange={(e) => setNewQuiz({...newQuiz, totalMarks: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={newQuiz.duration}
                    onChange={(e) => setNewQuiz({...newQuiz, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="timeLimit"
                  checked={newQuiz.timeLimit}
                  onChange={(e) => setNewQuiz({...newQuiz, timeLimit: e.target.checked})}
                />
                <label htmlFor="timeLimit" className="text-sm font-medium">Enforce time limit</label>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <div className="flex space-x-2">
                    <Dialog open={extractQuestionsDialogOpen} onOpenChange={setExtractQuestionsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-1" />
                          Extract Questions
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Extract Questions from Document</DialogTitle>
                          <DialogDescription>
                            Upload a PDF or PPT file to automatically extract questions. The system will identify multiple-choice, true/false, and short answer questions.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Upload Document</label>
                            <Input
                              type="file"
                              accept=".pdf,.ppt,.pptx,.doc,.docx"
                              onChange={(e) => setQuestionFile(e.target.files?.[0] || null)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setExtractQuestionsDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleExtractQuestions}>Extract Questions</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                </div>

                {newQuiz.questions.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <FileText className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No questions added yet. Add questions manually or extract them from a document.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {newQuiz.questions.map((question, index) => (
                      <Card key={question.id} className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Question {index + 1}</span>
                              <Badge variant="outline">{question.marks} marks</Badge>
                            </div>
                            <Select
                              value={question.type}
                              onValueChange={(value) => updateQuestion(index, 'type', value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                <SelectItem value="ESSAY">Essay</SelectItem>
                                <SelectItem value="CODE">Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Textarea
                            placeholder="Question text"
                            value={question.question}
                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          />
                          
                          {/* Options for multiple choice */}
                          {question.type === 'MULTIPLE_CHOICE' && (
                            <div className="space-y-2">
                              {question.options.map((option: string, optIndex: number) => (
                                <div key={optIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={question.correctAnswer === option}
                                    onChange={() => updateQuestion(index, 'correctAnswer', option)}
                                  />
                                  <Input
                                    placeholder={`Option ${optIndex + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[optIndex] = e.target.value;
                                      updateQuestion(index, 'options', newOptions);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Options for true/false */}
                          {question.type === 'TRUE_FALSE' && (
                            <div className="flex space-x-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === 'True'}
                                  onChange={() => updateQuestion(index, 'correctAnswer', 'True')}
                                />
                                <span>True</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === 'False'}
                                  onChange={() => updateQuestion(index, 'correctAnswer', 'False')}
                                />
                                <span>False</span>
                              </label>
                            </div>
                          )}
                          
                          {/* Answer for short answer */}
                          {question.type === 'SHORT_ANSWER' && (
                            <Input
                              placeholder="Correct answer"
                              value={question.correctAnswer || ''}
                              onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                            />
                          )}
                          
                          {/* Code template for code questions */}
                          {question.type === 'CODE' && (
                            <Textarea
                              placeholder="Code template (optional)"
                              value={question.codeTemplate || ''}
                              onChange={(e) => updateQuestion(index, 'codeTemplate', e.target.value)}
                              className="font-mono"
                            />
                          )}
                          
                          <div className="flex justify-end">
                            <Input
                              type="number"
                              placeholder="Marks"
                              value={question.marks}
                              onChange={(e) => updateQuestion(index, 'marks', parseInt(e.target.value))}
                              className="w-20"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateQuiz}>Create Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for quiz status */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        {['upcoming', 'active', 'completed', 'drafts'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{tab.charAt(0).toUpperCase() + tab.slice(1)} Quizzes</CardTitle>
                <CardDescription>
                  {tab === 'upcoming' && 'Quizzes scheduled for future dates'}
                  {tab === 'active' && 'Currently active quizzes'}
                  {tab === 'completed' && 'Past quizzes'}
                  {tab === 'drafts' && 'Unpublished quiz drafts'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Scheduled For</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes
                      .filter(quiz => {
                        const now = new Date();
                        const scheduledFor = new Date(quiz.scheduledFor);
                        const dueDate = new Date(quiz.dueDate);
                        
                        if (tab === 'drafts') return !quiz.isPublished;
                        if (tab === 'upcoming') return quiz.isPublished && scheduledFor > now;
                        if (tab === 'active') return quiz.isPublished && now >= scheduledFor && now <= dueDate;
                        if (tab === 'completed') return quiz.isPublished && now > dueDate;
                        return false;
                      })
                      .map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-medium">{quiz.title}</TableCell>
                          <TableCell>{quiz.subject?.name}</TableCell>
                          <TableCell>{formatDate(quiz.scheduledFor)}</TableCell>
                          <TableCell>{quiz.duration} mins</TableCell>
                          <TableCell>{quiz.questions?.length || 0}</TableCell>
                          <TableCell>{getQuizStatusBadge(quiz)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!quiz.isPublished && (
                                <>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => openScheduleDialog(quiz)}
                                  >
                                    <Calendar className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {quizzes.filter(quiz => {
                  const now = new Date();
                  const scheduledFor = new Date(quiz.scheduledFor);
                  const dueDate = new Date(quiz.dueDate);
                  
                  if (tab === 'drafts') return !quiz.isPublished;
                  if (tab === 'upcoming') return quiz.isPublished && scheduledFor > now;
                  if (tab === 'active') return quiz.isPublished && now >= scheduledFor && now <= dueDate;
                  if (tab === 'completed') return quiz.isPublished && now > dueDate;
                  return false;
                }).length === 0 && (
                  <div className="text-center p-4 text-gray-500">
                    No {tab} quizzes found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Schedule Quiz Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Quiz</DialogTitle>
            <DialogDescription>
              Set when the quiz will be available to students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Quiz</label>
              <Input value={selectedQuiz?.title} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date & Time</label>
              <Input
                type="datetime-local"
                value={scheduleData.scheduledFor}
                onChange={(e) => setScheduleData({...scheduleData, scheduledFor: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date & Time</label>
              <Input
                type="datetime-local"
                value={scheduleData.dueDate}
                onChange={(e) => setScheduleData({...scheduleData, dueDate: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifyStudents"
                checked={scheduleData.notifyStudents}
                onChange={(e) => setScheduleData({...scheduleData, notifyStudents: e.target.checked})}
              />
              <label htmlFor="notifyStudents" className="text-sm font-medium">Notify students via email</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleQuiz}>Schedule Quiz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
