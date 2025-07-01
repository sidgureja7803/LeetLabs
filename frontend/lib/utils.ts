import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'PPP');
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'PPp');
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (dueDate: string): boolean => {
  return isAfter(new Date(), parseISO(dueDate));
};

export const isDueSoon = (dueDate: string, hours: number = 24): boolean => {
  const due = parseISO(dueDate);
  const soon = new Date();
  soon.setHours(soon.getHours() + hours);
  return isBefore(due, soon) && isAfter(due, new Date());
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type) || 
         allowedTypes.some(type => type.includes(getFileExtension(file.name).toLowerCase()));
};

export const getFileIcon = (filename: string): string => {
  const extension = getFileExtension(filename).toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'ppt':
    case 'pptx':
      return '📊';
    case 'xls':
    case 'xlsx':
      return '📈';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'zip':
    case 'rar':
      return '📦';
    case 'py':
      return '🐍';
    case 'js':
    case 'ts':
      return '📜';
    case 'java':
      return '☕';
    case 'cpp':
    case 'c':
      return '⚙️';
    default:
      return '📄';
  }
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const initials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Number utilities
export const formatGrade = (marks: number, maxMarks: number): string => {
  const percentage = (marks / maxMarks) * 100;
  return `${marks}/${maxMarks} (${percentage.toFixed(1)}%)`;
};

export const getGradeColor = (marks: number, maxMarks: number): string => {
  const percentage = (marks / maxMarks) * 100;
  
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  if (percentage >= 60) return 'text-orange-600';
  return 'text-red-600';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidRollNumber = (rollNumber: string): boolean => {
  // Assuming format: 101903001 (year + program + sequence)
  const rollNumberRegex = /^\d{9}$/;
  return rollNumberRegex.test(rollNumber);
};

export const isValidEmployeeId = (employeeId: string): boolean => {
  // Flexible employee ID validation
  return employeeId.length >= 3 && employeeId.length <= 20;
};

// Array utilities
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// URL utilities
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const buildUrl = (path: string, params?: Record<string, string>): string => {
  const url = new URL(path, getBaseUrl());
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

// Local storage utilities
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

// Theme utilities
export const getThemeColor = (theme: 'light' | 'dark'): string => {
  return theme === 'dark' ? '#0f172a' : '#ffffff';
};

// Error utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

// Debug utilities
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const log = (...args: any[]): void => {
  if (isDevelopment()) {
    console.log(...args);
  }
};

export const logError = (...args: any[]): void => {
  if (isDevelopment()) {
    console.error(...args);
  }
}; 