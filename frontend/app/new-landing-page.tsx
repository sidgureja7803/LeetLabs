import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  BookOpen, 
  Users, 
  Award, 
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
  FileText,
  Upload,
  Play,
  Monitor,
  Layers,
  Clock,
  Target,
  Star,
  Quote,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EnhancedLandingPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Check for dummy credentials
    setTimeout(() => {
      if (loginData.email && loginData.password) {
        setSuccess('Login successful! Redirecting...');
        
        // Check user type based on email and redirect to appropriate dashboard
        if (loginData.email === 'admin@thapar.edu') {
          setTimeout(() => router.push('/admin'), 1000);
        } else if (loginData.email === 'teacher@thapar.edu') {
          setTimeout(() => router.push('/teacher'), 1000);
        } else if (loginData.email === 'student@thapar.edu') {
          setTimeout(() => router.push('/student'), 1000);
        } else if (loginData.email.includes('student')) {
          setTimeout(() => router.push('/student'), 1000);
        } else if (loginData.email.includes('teacher')) {
          setTimeout(() => router.push('/teacher'), 1000);
        } else {
          setTimeout(() => router.push('/student'), 1000); // Default to student
        }
      } else {
        setError('Please enter valid credentials.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const platformFeatures = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "View Assignments",
      description: "Access all your laboratory assignments with detailed instructions and requirements.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Play className="h-8 w-8" />,
      title: "Interactive PPTs",
      description: "View and interact with presentation materials designed for virtual learning.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Submit Solutions",
      description: "Upload your completed assignments and projects directly through the platform.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Monitor className="h-8 w-8" />,
      title: "Virtual Lab Access",
      description: "Experience laboratory experiments from the comfort of your home.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-time Tracking",
      description: "Monitor your progress and deadlines with our comprehensive tracking system.",
      color: "from-teal-500 to-blue-500"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Performance Analytics",
      description: "Get detailed insights into your learning progress and areas for improvement.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { number: "5000+", label: "Active Students", icon: <Users className="h-6 w-6" /> },
    { number: "200+", label: "Faculty Members", icon: <Award className="h-6 w-6" /> },
    { number: "150+", label: "Virtual Labs", icon: <Beaker className="h-6 w-6" /> },
    { number: "99.9%", label: "Platform Uptime", icon: <Shield className="h-6 w-6" /> }
  ];

  const departments = [
    { 
      name: "Computer Science & Engineering", 
      code: "CSE", 
      icon: <Cpu className="h-8 w-8" />,
      labs: 25,
      color: "from-blue-600 to-blue-800"
    },
    { 
      name: "Electronics & Communication", 
      code: "ECE", 
      icon: <Zap className="h-8 w-8" />,
      labs: 20,
      color: "from-yellow-600 to-orange-600"
    },
    { 
      name: "Mechanical Engineering", 
      code: "ME", 
      icon: <Beaker className="h-8 w-8" />,
      labs: 18,
      color: "from-green-600 to-green-800"
    },
    { 
      name: "Civil Engineering", 
      code: "CE", 
      icon: <Globe className="h-8 w-8" />,
      labs: 15,
      color: "from-purple-600 to-purple-800"
    }
  ];

  const testimonials = [
    {
      name: "Arjun Sharma",
      role: "CSE Student",
      content: "The virtual labs have revolutionized my learning experience. I can now practice coding and run experiments anytime, anywhere!",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "ECE Student",
      content: "Amazing platform! The interactive assignments and real-time feedback have helped me understand complex concepts better.",
      rating: 5
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Faculty, ME Department",
      content: "As an educator, this platform has made it so much easier to track student progress and provide personalized guidance.",
      rating: 5
    }
  ];

  const teamMembers = [
    {
      name: "Dr. Maninder Singh",
      role: "Project Mentor",
      bio: "Head of Computer Science Department with 15+ years in educational technology.",
      social: { linkedin: "#", twitter: "#" }
    },
    {
      name: "Rohit Verma",
      role: "Lead Developer",
      bio: "Full-stack developer specializing in educational platforms and React ecosystems.",
      social: { github: "#", linkedin: "#" }
    },
    {
      name: "Sneha Gupta",
      role: "UI/UX Designer",
      bio: "Creative designer focused on intuitive user experiences in educational technology.",
      social: { linkedin: "#" }
    },
    {
      name: "Karthik Reddy",
      role: "Backend Developer",
      bio: "Systems architect with expertise in scalable educational infrastructure.",
      social: { github: "#", linkedin: "#" }
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Beaker className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thapar Virtual Labs
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#platform" className="text-gray-600 hover:text-blue-600 transition-colors">Platform</a>
            <a href="#team" className="text-gray-600 hover:text-blue-600 transition-colors">Our Team</a>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">        
        {/* Admin Block Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-indigo-900/90 z-10" />
          <Image 
            src="/assets/Admin-Block.png" 
            alt="Thapar Admin Block" 
            fill 
            className="object-cover object-center" 
            priority 
          />
        </div>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-indigo-900/90 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-32 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white">
              {/* TIET Logo and Name */}
              <div className="flex items-center mb-8 space-x-4">
                <Image 
                  src="/assets/Tiet-Logo.png" 
                  alt="Thapar Institute Logo" 
                  width={80} 
                  height={80} 
                  className="rounded-full bg-white p-1" 
                />
                <Image 
                  src="/assets/Name.png" 
                  alt="Thapar Institute Name" 
                  width={280} 
                  height={60} 
                  className="rounded-md bg-white/20 backdrop-blur-sm p-2" 
                />
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
                <Star className="h-4 w-4 mr-2 text-yellow-400" />
                Next-Generation Virtual Learning
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Experience
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Virtual Labs
                </span>
                <br />
                From Home
              </h1>
              
              <p className="text-xl lg:text-2xl mb-8 text-gray-200 leading-relaxed">
                Access laboratory assignments, view interactive presentations, and submit solutions from anywhere. 
                Experience the future of engineering education at Thapar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                >
                  Watch Demo <Play className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-300">5000+ Active Students</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-300 ml-2">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div>
              <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl shadow-2xl border-0 overflow-hidden">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-center text-gray-600">
                    Sign in to access your virtual laboratory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
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
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 h-12"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-12"
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
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In to Lab'
                      )}
                    </Button>
                    
                    <div className="flex justify-between text-sm">
                      <a href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                        Forgot password?
                      </a>
                      <a href="/signup" className="text-blue-600 hover:text-blue-800">
                        Create account
                      </a>
                    </div>
                  </form>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-center text-sm text-gray-600 mb-2">Demo Credentials:</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p><strong className="text-blue-600">Admin:</strong> admin@thapar.edu / admin123</p>
                      <p><strong className="text-purple-600">Teacher:</strong> teacher@thapar.edu / teacher123</p>
                      <p><strong className="text-green-600">Student:</strong> student@thapar.edu / student123</p>
                      <p><strong className="text-green-600">Student (Siddhant):</strong> siddhant.gureja@thapar.edu / student123</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white mb-4 shadow-lg">
                  {stat.icon}
                </div>
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="platform" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm mb-6">
              <Layers className="h-4 w-4 mr-2 text-blue-600" />
              Platform Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Everything You Need for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Virtual Learning</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools you need to access assignments, 
              view presentations, submit solutions, and track your progress from anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="group">
                <Card className="h-full hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border-0 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardHeader className="relative">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-sm mb-6">
                <Globe className="h-4 w-4 mr-2 text-orange-600" />
                Our Campus
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Modern Infrastructure for
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Digital Learning</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Thapar Institute's state-of-the-art campus combines traditional excellence with cutting-edge technology, 
                providing the perfect environment for virtual laboratory experiences.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">High-speed internet connectivity across campus</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">Advanced computer labs and digital infrastructure</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">24/7 technical support for virtual labs</span>
                </div>
              </div>
              
              <Button size="lg" className="mt-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                Take Virtual Tour <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <div className="w-full h-96 relative">
                  <Image 
                    src="/assets/Admin-Block.png" 
                    alt="Thapar Admin Block" 
                    fill 
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-red-900/30" />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="font-bold text-gray-900">Thapar Institute Campus</h3>
                    <p className="text-sm text-gray-600">Modern infrastructure supporting digital innovation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm mb-6 shadow-sm">
              <Award className="h-4 w-4 mr-2 text-blue-600" />
              Engineering Excellence
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Virtual Labs Across All
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Engineering Streams</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience comprehensive virtual laboratory facilities across all major engineering departments 
              with cutting-edge simulations and real-world applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="group">
                <Card className="h-full hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 border-0 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardHeader className="text-center relative">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${dept.color} rounded-3xl text-white mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {dept.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:text-white transition-colors">
                      {dept.code}
                    </CardTitle>
                    <CardDescription className="group-hover:text-gray-100 transition-colors">
                      {dept.name}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm font-medium group-hover:bg-white/20 group-hover:text-white transition-colors">
                        {dept.labs} Virtual Labs
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full text-sm mb-6">
              <Quote className="h-4 w-4 mr-2 text-green-600" />
              Student Voices
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              What Our Community
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Says</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from students and faculty who are experiencing the future of engineering education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section id="team" className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
              <Users className="h-4 w-4 mr-2" />
              Meet the Team
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              The Minds Behind
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Virtual Labs</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our dedicated team of educators, developers, and designers working to revolutionize engineering education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-cyan-300 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{member.bio}</p>
                    <div className="flex justify-center space-x-3">
                      {member.social.github && (
                        <a href={member.social.github} className="text-gray-400 hover:text-white transition-colors">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} className="text-gray-400 hover:text-white transition-colors">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a href={member.social.twitter} className="text-gray-400 hover:text-white transition-colors">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 px-8 py-4">
              Join Our Team <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to Start Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"> Virtual Journey?</span>
            </h2>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Join thousands of students already experiencing the future of engineering education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                Schedule Demo <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 relative">
                  <Image 
                    src="/assets/Tiet-Logo.png" 
                    alt="Thapar Institute Logo" 
                    fill 
                    className="rounded-xl" 
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Thapar Virtual Labs</h3>
                  <p className="text-gray-400">Future of Engineering Education</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Empowering the next generation of engineers through innovative virtual laboratory experiences 
                and cutting-edge educational technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#platform" className="text-gray-400 hover:text-white transition-colors">Platform</a></li>
                <li><a href="#team" className="text-gray-400 hover:text-white transition-colors">Our Team</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">System Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
              
              <div className="mt-8">
                <h5 className="font-semibold mb-4">Contact Info</h5>
                <div className="text-gray-400 space-y-2 text-sm">
                  <p>Thapar Institute of Engineering and Technology</p>
                  <p>Patiala, Punjab, India - 147004</p>
                  <p>Phone: +91-175-239-3021</p>
                  <p>Email: virtualabs@thapar.edu</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2024 Thapar Institute of Engineering and Technology. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}