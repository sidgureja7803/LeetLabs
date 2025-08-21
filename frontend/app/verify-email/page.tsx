"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'expired' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      verifyEmail(token, email);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new verification email.');
    }
  }, [token, email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await authAPI.verifyEmail({ token, email });
      setStatus('success');
      setMessage(response.data?.message || 'Your email has been successfully verified. You can now log in.');
      
      // Auto-redirect to login after 5 seconds
      setTimeout(() => {
        router.push('/');
      }, 5000);
    } catch (error: any) {
      if (error.response?.status === 410) {
        setStatus('expired');
        setMessage('This verification link has expired. Please request a new one.');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'An error occurred while verifying your email. Please try again.');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendLoading) return;
    
    try {
      setResendLoading(true);
      await authAPI.resendVerification({ email });
      setResendSuccess(true);
      setCountdown(60); // 60 seconds cooldown
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Verify your email address to activate your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {status === 'verifying' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thapar-blue"></div>
            )}
            
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            
            {status === 'expired' && (
              <Clock className="h-16 w-16 text-amber-500" />
            )}
            
            {status === 'error' && (
              <AlertCircle className="h-16 w-16 text-red-500" />
            )}
            
            <p className="text-lg font-medium">{message}</p>
            
            {status === 'success' && (
              <p className="text-sm text-gray-500">
                You will be redirected to the login page in a few seconds...
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {(status === 'expired' || status === 'error') && email && (
            <Button 
              onClick={handleResendVerification}
              disabled={resendLoading || countdown > 0 || resendSuccess}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : resendSuccess ? (
                'Verification email sent!'
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          )}
          
          {resendSuccess && (
            <p className="text-sm text-green-600 text-center">
              A new verification email has been sent to {email}. Please check your inbox.
            </p>
          )}
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
