import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any additional headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Redirect to login page on unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } else if (error.response?.status === 403) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to perform this action.',
        variant: 'destructive',
      });
    } else if (error.response?.status === 429) {
      toast({
        title: 'Too Many Requests',
        description: 'Please slow down and try again later.',
        variant: 'destructive',
      });
    } else if (error.response?.status >= 500) {
      toast({
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    rollNumber?: string;
    employeeId?: string;
    departmentId?: string;
  }) => api.post('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
    
  verifyEmail: (data: { token: string; email: string }) =>
    api.post('/auth/verify-email', data),
    
  resendVerification: (data: { email: string }) =>
    api.post('/auth/resend-verification', data),
    
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
    
  resetPassword: (data: { token: string; email: string; password: string }) =>
    api.post('/auth/reset-password', data),
};

export const adminAPI = {
  getUsers: (params: {
    page?: number;
    limit?: number;
    role?: string;
    department?: string;
    search?: string;
  }) => api.get('/admin/users', { params }),
  
  createTeacher: (teacherData: {
    email: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    departmentId?: string;
    subjects?: string[];
  }) => api.post('/admin/teachers', teacherData),
  
  getDepartments: () => api.get('/admin/departments'),
  
  createDepartment: (departmentData: {
    name: string;
    code: string;
  }) => api.post('/admin/departments', departmentData),
  
  updateDepartment: (departmentId: string, departmentData: {
    name: string;
    code: string;
  }) => api.put(`/admin/departments/${departmentId}`, departmentData),
  
  deleteDepartment: (departmentId: string) => api.delete(`/admin/departments/${departmentId}`),
  
  getTeachers: (departmentId?: string) =>
    api.get('/admin/teachers', { params: { departmentId } }),
  
  getSubjects: (departmentId?: string) =>
    api.get('/admin/subjects', { params: { departmentId } }),
  
  createSubject: (subjectData: {
    name: string;
    code: string;
    description?: string;
    credits: number;
    semester: number;
    departmentId: string;
  }) => api.post('/admin/subjects', subjectData),
  
  updateSubject: (subjectId: string, subjectData: {
    name: string;
    code: string;
    description?: string;
    credits: number;
    semester: number;
    departmentId: string;
  }) => api.put(`/admin/subjects/${subjectId}`, subjectData),
  
  deleteSubject: (subjectId: string) => api.delete(`/admin/subjects/${subjectId}`),
  
  assignTeacherToSubject: (data: {
    teacherId: string;
    subjectId: string;
    semester: string;
  }) => api.post('/admin/assign-teacher', data),
  
  flushSemester: (data: { semesterToFlush: string; confirmationText: string }) =>
    api.post('/admin/flush-semester', data),
  
  getSystemStats: () => api.get('/admin/stats'),
};

export const subjectsAPI = {
  getMySubjects: () => api.get('/subjects/my-subjects'),
  
  getSubjectDetails: (subjectId: string) => api.get(`/subjects/${subjectId}`),
  
  getSubjectAssignments: (subjectId: string) =>
    api.get(`/subjects/${subjectId}/assignments`),
};

export const assignmentsAPI = {
  createAssignment: (data: FormData) => api.post('/assignments', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  getAssignment: (assignmentId: string) => api.get(`/assignments/${assignmentId}`),
  
  getStudentAssignments: () => api.get('/student/assignments'),
  
  getTeacherAssignments: () => api.get('/teacher/assignments'),
  
  updateAssignment: (assignmentId: string, data: FormData) =>
    api.put(`/assignments/${assignmentId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteAssignment: (assignmentId: string) => api.delete(`/assignments/${assignmentId}`),
  
  getAssignmentSubmissions: (assignmentId: string) =>
    api.get(`/assignments/${assignmentId}/submissions`),
};

export const submissionsAPI = {
  submitAssignment: (assignmentId: string, data: FormData) =>
    api.post(`/submissions/${assignmentId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getMySubmissions: () => api.get('/submissions/my-submissions'),
  
  getStudentSubmissions: () => api.get('/student/submissions'),
  
  getSubmissionDetails: (submissionId: string) =>
    api.get(`/submissions/${submissionId}`),
  
  gradeSubmission: (submissionId: string, data: { marks: number; feedback?: string }) =>
    api.patch(`/submissions/${submissionId}/grade`, data),
};

export const quizAPI = {
  createQuiz: (quizData: any) => api.post('/quizzes', quizData),
  
  getTeacherQuizzes: () => api.get('/quizzes/teacher'),
  
  getStudentQuizzes: () => api.get('/quizzes/student'),
  
  getQuizDetails: (quizId: string) => api.get(`/quizzes/${quizId}`),
  
  updateQuiz: (quizId: string, quizData: any) => api.put(`/quizzes/${quizId}`, quizData),
  
  deleteQuiz: (quizId: string) => api.delete(`/quizzes/${quizId}`),
  
  scheduleQuiz: (scheduleData: any) => api.post('/quizzes/schedule', scheduleData),
  
  extractQuestionsFromFile: (formData: FormData) => api.post('/quizzes/extract-questions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  startQuizAttempt: (quizId: string) => api.post(`/quizzes/${quizId}/attempt`),
  
  submitQuizAnswer: (attemptId: string, questionId: string, answer: string) => 
    api.post(`/quizzes/attempts/${attemptId}/questions/${questionId}/answer`, { answer }),
  
  submitQuizAttempt: (attemptId: string) => api.post(`/quizzes/attempts/${attemptId}/submit`),
  
  getQuizResults: (quizId: string) => api.get(`/quizzes/${quizId}/results`),
};

export const filesAPI = {
  uploadFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getFileUrl: (fileKey: string) => api.get(`/files/${fileKey}/url`),
  
  deleteFile: (fileKey: string) => api.delete(`/files/${fileKey}`),
};

export default api; 