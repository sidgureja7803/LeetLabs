// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  rollNumber?: string;
  employeeId?: string;
  profileImage?: string;
  isActive: boolean;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  semester: number;
  credits: number;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherSubject {
  id: string;
  teacher: User;
  subject: Subject;
  semester: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  fileUrl?: string;
  fileName?: string;
  isActive: boolean;
  subject: Subject;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[];
  _count?: {
    submissions: number;
  };
}

export interface Submission {
  id: string;
  fileUrl: string;
  fileName: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  marks?: number;
  feedback?: string;
  submittedAt: string;
  assignment: Assignment;
  student: User;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalCount: number;
    };
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER';
  rollNumber?: string;
  employeeId?: string;
  departmentId?: string;
}

export interface CreateTeacherFormData {
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  departmentId?: string;
  subjects?: string[];
}

export interface CreateAssignmentFormData {
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  subjectId: string;
  file?: File;
}

export interface SubmitAssignmentFormData {
  file: File;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Dashboard types
export interface StudentDashboardData {
  recentAssignments: Assignment[];
  pendingSubmissions: Assignment[];
  submissionStats: {
    total: number;
    pending: number;
    submitted: number;
    graded: number;
  };
}

export interface TeacherDashboardData {
  mySubjects: Subject[];
  recentAssignments: Assignment[];
  pendingGradings: Submission[];
  assignmentStats: {
    total: number;
    active: number;
    submissions: number;
  };
}

export interface AdminDashboardData {
  systemStats: {
    users: {
      total: number;
      students: number;
      teachers: number;
      admins: number;
    };
    academics: {
      subjects: number;
      assignments: number;
      submissions: number;
      activeSemesters: string[];
    };
  };
  recentUsers: User[];
  recentAssignments: Assignment[];
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
  external?: boolean;
}

export interface SidebarNavItem extends NavItem {
  items?: SidebarNavItem[];
}

// Utility types
export type UserRole = User['role'];

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  key?: string;
  error?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
  description?: string;
}

// Search and filter types
export interface SearchFilters {
  search?: string;
  role?: UserRole;
  department?: string;
  semester?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Layout types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface PageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
} 