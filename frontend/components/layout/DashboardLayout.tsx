"use client";

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  BookOpen, 
  Assignment, 
  ClipboardCheck, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Redirect to appropriate dashboard based on role
  useEffect(() => {
    if (user) {
      const currentPath = window.location.pathname;
      const expectedPath = `/${user.role.toLowerCase()}`;
      
      if (currentPath === '/' || (!currentPath.includes('/admin') && !currentPath.includes('/teacher') && !currentPath.includes('/student'))) {
        router.push(expectedPath);
      }
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/${user?.role.toLowerCase()}`, icon: Home }
    ];

    switch (user?.role) {
      case 'ADMIN':
        return [
          ...baseItems,
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Departments', href: '/admin/departments', icon: BookOpen },
          { name: 'System Settings', href: '/admin/settings', icon: Settings }
        ];
      case 'TEACHER':
        return [
          ...baseItems,
          { name: 'My Subjects', href: '/teacher/subjects', icon: BookOpen },
          { name: 'Assignments', href: '/teacher/assignments', icon: Assignment },
          { name: 'Submissions', href: '/teacher/submissions', icon: ClipboardCheck },
          { name: 'Students', href: '/teacher/students', icon: Users }
        ];
      case 'STUDENT':
        return [
          ...baseItems,
          { name: 'Assignments', href: '/student/assignments', icon: Assignment },
          { name: 'Submissions', href: '/student/submissions', icon: ClipboardCheck },
          { name: 'Grades', href: '/student/grades', icon: BookOpen },
          { name: 'Subjects', href: '/student/subjects', icon: BookOpen }
        ];
      default:
        return baseItems;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'TEACHER':
        return 'default';
      case 'STUDENT':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue"></div>
      </div>
    );
  }

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-thapar-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-gray-900">Thapar Labs</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-600">{user.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <div className="flex items-center space-x-2">
                <Badge variant={getRoleBadgeColor(user.role)}>{user.role}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </a>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Button>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <div className="w-8 h-8 bg-thapar-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user.name?.charAt(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 