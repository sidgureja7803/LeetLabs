"use client";

import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    try {
      setStatus('submitting');
      const response = await authAPI.forgotPassword({ email });
      setStatus('success');
      setMessage(response.data?.message || 'Password reset instructions have been sent to your email.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'idle' || status === 'error' || status === 'submitting' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              {status === 'error' && (
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{message}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center font-medium">{message}</p>
              <div className="text-center text-sm text-gray-500">
                <p>We've sent a password reset link to:</p>
                <p className="font-medium mt-1">{email}</p>
                <p className="mt-4">Please check your email inbox and follow the instructions to reset your password.</p>
                <p className="mt-2">The link will expire in 10 minutes.</p>
              </div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                }}
              >
                Try Another Email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
