'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Award, 
  ChevronRight, 
  Code, 
  Beaker,
  Cpu,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { getRedirectPath } from '@/lib/auth';
import LandingPage from './new-landing-page';

export default function Home() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(getRedirectPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Interactive Learning",
      description: "Engage with virtual labs and interactive assignments designed for modern education."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Collaborative Platform",
      description: "Connect students, teachers, and administrators in a unified learning environment."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Performance Tracking",
      description: "Monitor progress with detailed analytics and automated grading systems."
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Code Submissions",
      description: "Submit and review code assignments with integrated file management."
    },
    {
      icon: <Beaker className="h-8 w-8" />,
      title: "Virtual Experiments",
      description: "Conduct experiments in a safe, virtual environment with real-time feedback."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Enterprise-grade security with role-based access control and data protection."
    }
  ];

  const stats = [
    { number: "1000+", label: "Students" },
    { number: "100+", label: "Faculty" },
    { number: "50+", label: "Courses" },
    { number: "99.9%", label: "Uptime" }
  ];

  const departments = [
    { name: "Computer Science & Engineering", code: "CSE", icon: <Cpu className="h-6 w-6" /> },
    { name: "Electronics & Communication", code: "ECE", icon: <Zap className="h-6 w-6" /> },
    { name: "Mechanical Engineering", code: "ME", icon: <Beaker className="h-6 w-6" /> },
    { name: "Civil Engineering", code: "CE", icon: <Globe className="h-6 w-6" /> },
  ];

  return <LandingPage />;
}