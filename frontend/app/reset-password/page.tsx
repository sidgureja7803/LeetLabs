"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'submitting' | 'success' | 'error'>('validating');
  const [message, setMessage] = useState('Validating your reset link...');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      // Just validate that the token and email are present
      // The actual validation will happen when they submit the new password
      setStatus('valid');
      setMessage('');
    } else {
      setStatus('invalid');
      setMessage('Invalid password reset link. Please request a new one.');
    }
  }, [token, email]);

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword() || !token || !email) return;
    
    try {
      setStatus('submitting');
      await authAPI.resetPassword({
        token,
        email,
        password
      });
      setStatus('success');
      setMessage('Your password has been successfully reset. You can now log in with your new password.');
      
      // Auto-redirect to login after 5 seconds
      setTimeout(() => {
        router.push('/');
      }, 5000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'An error occurred while resetting your password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'validating' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thapar-blue"></div>
              <p className="text-center">{message}</p>
            </div>
          )}
          
          {status === 'invalid' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p className="text-center font-medium">{message}</p>
              <Button asChild className="mt-4">
                <Link href="/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>
            </div>
          )}
          
          {status === 'valid' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
              </div>
              
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center font-medium">{message}</p>
              <p className="text-sm text-gray-500 text-center">
                You will be redirected to the login page in a few seconds...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p className="text-center font-medium">{message}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
