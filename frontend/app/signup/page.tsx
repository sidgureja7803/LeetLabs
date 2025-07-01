'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  User,
  UserPlus,
  Building2,
  Hash,
  BadgeCheck
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authAPI } from '@/lib/api';
import { isValidEmail, isValidPassword, isValidRollNumber } from '@/lib/utils';
import { RegisterFormData } from '@/lib/types';

export default function SignupPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    rollNumber: '',
    employeeId: '',
    departmentId: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState<{ id: string; name: string; }[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        if (data.success) {
          setDepartments(data.data.departments);
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.firstName || !formData.lastName || !formData.role || !formData.departmentId) {
      setError('All required fields must be filled');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isValidPassword(formData.password)) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.role === 'STUDENT' && !formData.rollNumber) {
      setError('Roll number is required for students');
      return false;
    }

    if (formData.role === 'STUDENT' && !isValidRollNumber(formData.rollNumber!)) {
      setError('Please enter a valid roll number (9 digits)');
      return false;
    }

    if ((formData.role === 'TEACHER' || formData.role === 'ADMIN') && !formData.employeeId) {
      setError('Employee ID is required for teachers and admin');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(formData);
      
      if (response.data.success) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        // Clear form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'STUDENT',
          rollNumber: '',
          employeeId: '',
          departmentId: ''
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register for Thapar Virtual Labs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      className="pl-10"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'STUDENT' | 'TEACHER' }))}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Conditional Fields */}
              {formData.role === 'STUDENT' && (
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="rollNumber"
                      placeholder="Enter your roll number"
                      className="pl-10"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.role === 'TEACHER' && (
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="employeeId"
                      placeholder="Enter your employee ID"
                      className="pl-10"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 