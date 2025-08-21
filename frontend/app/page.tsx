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
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { getRedirectPath } from '@/lib/auth';

export default function LandingPage() {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(getRedirectPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        setSuccess('Login successful! Redirecting...');
        // Redirect will happen through useEffect
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-pattern">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl lg:text-6xl font-bold font-heading mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Thapar Virtual Labs
                </span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Empowering the next generation of engineers through innovative virtual laboratory experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/team">Meet Our Team</Link>
                </Button>
              </div>
            </motion.div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="w-full max-w-md mx-auto">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
                  <CardDescription className="text-center">
                    Enter your credentials to access the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
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

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                    
                    <div className="flex justify-between text-sm">
                      <Link href="/forgot-password" className="text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                      <Link href="/signup" className="text-blue-600 hover:underline">
                        Create account
                      </Link>
                    </div>
                  </form>

                  <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Demo Credentials:</p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p><strong>Admin:</strong> admin@thapar.edu / admin123</p>
                      <p><strong>Teacher:</strong> teacher@thapar.edu / teacher123</p>
                      <p><strong>Student:</strong> student@thapar.edu / student123</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose Thapar Virtual Labs?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience cutting-edge virtual laboratory technology designed specifically for engineering education.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full card-hover">
                  <CardHeader>
                    <div className="text-blue-600 mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Engineering Departments
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore virtual labs across all major engineering disciplines at Thapar Institute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="card-hover text-center">
                  <CardHeader>
                    <div className="text-blue-600 mx-auto mb-4">{dept.icon}</div>
                    <CardTitle className="text-lg">{dept.code}</CardTitle>
                    <CardDescription>{dept.name}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* College Images Section - Placeholder */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our Beautiful Campus
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Take a virtual tour of Thapar Institute's state-of-the-art facilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center"
              >
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🏛️</div>
                  <p>Campus Image {index}</p>
                  <p className="text-sm">Add your images here</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Thapar Virtual Labs</h3>
              <p className="text-gray-400">
                Empowering engineering education through innovative virtual laboratory experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/team" className="hover:text-white">Our Team</Link></li>
                <li><Link href="#" className="hover:text-white">Departments</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="text-gray-400 space-y-2">
                <p>Thapar Institute of Engineering and Technology</p>
                <p>Patiala, Punjab, India</p>
                <p>Email: info@thapar.edu</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Thapar Institute of Engineering and Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 