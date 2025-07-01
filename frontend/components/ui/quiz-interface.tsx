'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Textarea } from './textarea';
import { Input } from './input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './dialog';
import { Clock, CheckCircle, AlertCircle, Code, FileText, HelpCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'CODE';
  options?: string[];
  marks: number;
  codeTemplate?: string;
  order: number;
}

interface QuizAttempt {
  id: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    instructions: string;
    duration: number;
    totalMarks: number;
    timeLimit: boolean;
  };
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionId: string;
  answer: string;
}

interface QuizInterfaceProps {
  attempt: QuizAttempt;
  onSubmit: (answers: QuizAnswer[]) => Promise<void>;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<void>;
  className?: string;
}

export function QuizInterface({ attempt, onSubmit, onSubmitAnswer, className }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(attempt.quiz.duration * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  const currentQuestion = attempt.questions[currentQuestionIndex];
  const totalQuestions = attempt.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Timer effect
  useEffect(() => {
    if (!attempt.quiz.timeLimit || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attempt.quiz.timeLimit]);

  // Auto-save answers
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      autoSaveCurrentAnswer();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, []);

  const autoSaveCurrentAnswer = useCallback(async () => {
    const currentAnswer = answers.get(currentQuestion.id);
    if (!currentAnswer || autoSaveStatus === 'saving') return;

    setAutoSaveStatus('saving');
    try {
      await onSubmitAnswer(currentQuestion.id, currentAnswer);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [currentQuestion.id, answers, onSubmitAnswer, autoSaveStatus]);

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    await handleFinalSubmit(false);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => new Map(prev.set(questionId, answer)));
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) return;
    autoSaveCurrentAnswer();
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePreviousQuestion = () => {
    if (isFirstQuestion) return;
    autoSaveCurrentAnswer();
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleQuestionNavigation = (index: number) => {
    autoSaveCurrentAnswer();
    setCurrentQuestionIndex(index);
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleFinalSubmit = async (manual = true) => {
    if (isSubmitting) return;

    if (manual) {
      setShowSubmitDialog(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const answersArray = Array.from(answers.entries()).map(([questionId, answer]) => ({
        questionId,
        answer
      }));
      await onSubmit(answersArray);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return attempt.questions.filter(q => answers.has(q.id) && answers.get(q.id)?.trim()).length;
  };

  const getQuestionStatusColor = (question: QuizQuestion) => {
    const hasAnswer = answers.has(question.id) && answers.get(question.id)?.trim();
    const isFlagged = flaggedQuestions.has(question.id);
    
    if (isFlagged) return 'bg-yellow-500';
    if (hasAnswer) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const renderQuestionContent = (question: QuizQuestion) => {
    const currentAnswer = answers.get(question.id) || '';

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full"
          />
        );

      case 'ESSAY':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Write your detailed answer here..."
            className="w-full min-h-32"
            rows={8}
          />
        );

      case 'CODE':
        return (
          <div className="space-y-3">
            {question.codeTemplate && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Code Template:</p>
                <pre className="text-xs text-gray-700">{question.codeTemplate}</pre>
              </div>
            )}
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Write your code here..."
              className="w-full font-mono text-sm min-h-40"
              rows={12}
            />
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        return <HelpCircle className="w-4 h-4" />;
      case 'SHORT_ANSWER':
      case 'ESSAY':
        return <FileText className="w-4 h-4" />;
      case 'CODE':
        return <Code className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header with Timer and Progress */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{attempt.quiz.title}</h1>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions} • {getAnsweredCount()} Answered
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {autoSaveStatus !== 'idle' && (
              <Badge variant={autoSaveStatus === 'saved' ? 'default' : autoSaveStatus === 'saving' ? 'secondary' : 'destructive'}>
                {autoSaveStatus === 'saving' && 'Saving...'}
                {autoSaveStatus === 'saved' && 'Saved'}
                {autoSaveStatus === 'error' && 'Save Error'}
              </Badge>
            )}
            {attempt.quiz.timeLimit && (
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((getAnsweredCount() / totalQuestions) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getAnsweredCount() / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Questions</h3>
            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
              {attempt.questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => handleQuestionNavigation(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : `${getQuestionStatusColor(question)} text-white hover:opacity-80`
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Not answered</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      {getQuestionIcon(currentQuestion.type)}
                      <span>{currentQuestion.type.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant="secondary">{currentQuestion.marks} marks</Badge>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={flaggedQuestions.has(currentQuestion.id) ? 'bg-yellow-100 border-yellow-300' : ''}
                >
                  🚩 Flag
                </Button>
              </div>

              {/* Question Content */}
              <div className="space-y-4">
                {renderQuestionContent(currentQuestion)}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={isFirstQuestion}
                >
                  Previous
                </Button>

                <div className="flex space-x-3">
                  {!isLastQuestion ? (
                    <Button onClick={handleNextQuestion}>
                      Next
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleFinalSubmit(true)}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your quiz? You have answered {getAnsweredCount()} out of {totalQuestions} questions.
              {timeRemaining > 0 && attempt.quiz.timeLimit && (
                ` You still have ${formatTime(timeRemaining)} remaining.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleFinalSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 