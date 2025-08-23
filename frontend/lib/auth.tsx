'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from './api';
import { User, UserRole } from './types';
import { toast } from '@/components/ui/use-toast';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check if user has any of the specified roles
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        setUser(response.data.data.user);
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    hasRole,
  };

  // Completely rewriting the JSX to fix syntax error
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  const AuthenticatedComponent = (props: P) => {
    const { user, isLoading, isAuthenticated, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/');
          return;
        }

        if (allowedRoles && !hasRole(allowedRoles)) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this page.',
            variant: 'destructive',
          });
          
          // Redirect to appropriate dashboard based on role
          switch (user?.role) {
            case 'ADMIN':
              router.push('/dashboard/admin');
              break;
            case 'TEACHER':
              router.push('/dashboard/teacher');
              break;
            case 'STUDENT':
              router.push('/dashboard/student');
              break;
            default:
              router.push('/');
          }
          return;
        }
      }
    }, [user, isLoading, isAuthenticated, hasRole, router]);

    if (isLoading) {
      return <div>Loading...</div>; // You can replace this with a proper loading component
    }

    if (!isAuthenticated) {
      return null;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
      return null;
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
}

// Utility functions
export const getRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'TEACHER':
      return '/dashboard/teacher';
    case 'STUDENT':
      return '/dashboard/student';
    default:
      return '/';
  }
};

export const isAuthorized = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

// Route guards
export const canAccessAdminRoutes = (user: User | null): boolean => {
  return user?.role === 'ADMIN';
};

export const canAccessTeacherRoutes = (user: User | null): boolean => {
  return user?.role === 'TEACHER' || user?.role === 'ADMIN';
};

export const canAccessStudentRoutes = (user: User | null): boolean => {
  return user?.role === 'STUDENT' || user?.role === 'TEACHER' || user?.role === 'ADMIN';
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
            role: true,
            departmentId: true,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          departmentId: user.departmentId,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.departmentId = token.departmentId;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
      }

      return token;
    },
  },
}; 