'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl max-w-2xl text-blue-100">
            Learn about Thapar Virtual Labs and our mission to transform engineering education through innovative virtual laboratory experiences.
          </p>
        </div>
      </header>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To provide accessible, high-quality virtual laboratory experiences that enhance engineering education and prepare students for real-world challenges.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🔬</div>
                  <p>Virtual Lab Image</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold mb-4">Transforming Engineering Education</h3>
              <p className="text-gray-600 mb-4">
                Thapar Virtual Labs is a pioneering initiative by Thapar Institute of Engineering and Technology to revolutionize how engineering concepts are taught and learned.
              </p>
              <p className="text-gray-600 mb-4">
                Our platform provides students with access to state-of-the-art virtual laboratories that simulate real-world engineering environments, allowing for hands-on learning experiences without the constraints of physical infrastructure.
              </p>
              <p className="text-gray-600">
                By leveraging cutting-edge technology, we're making quality engineering education more accessible, interactive, and engaging for students across all disciplines.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers a comprehensive suite of tools and features designed to enhance the learning experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Interactive Simulations",
                description: "Engage with realistic simulations that mimic real-world engineering scenarios and equipment.",
                icon: "🔄"
              },
              {
                title: "Cross-Platform Accessibility",
                description: "Access virtual labs from any device, anywhere, anytime - no special hardware required.",
                icon: "💻"
              },
              {
                title: "Comprehensive Assessment",
                description: "Track progress with integrated quizzes, assignments, and performance analytics.",
                icon: "📊"
              },
              {
                title: "Collaborative Learning",
                description: "Work together with peers on experiments and projects in real-time virtual environments.",
                icon: "👥"
              },
              {
                title: "Expert Guidance",
                description: "Receive support from experienced faculty through integrated communication tools.",
                icon: "👨‍🏫"
              },
              {
                title: "Industry-Relevant Skills",
                description: "Develop practical skills that align with current industry standards and practices.",
                icon: "🛠️"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From concept to reality - the evolution of Thapar Virtual Labs.
            </p>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                year: "2020",
                title: "Concept Development",
                description: "The idea for Thapar Virtual Labs was born out of the need for remote learning solutions during the global pandemic."
              },
              {
                year: "2021",
                title: "Prototype Launch",
                description: "The first version of our platform was developed and tested with a small group of engineering students and faculty."
              },
              {
                year: "2022",
                title: "Expansion Phase",
                description: "We expanded our virtual lab offerings to cover more engineering disciplines and improved the platform based on user feedback."
              },
              {
                year: "2023",
                title: "Full Integration",
                description: "Thapar Virtual Labs became fully integrated into the curriculum, serving thousands of students across multiple departments."
              },
              {
                year: "2024",
                title: "Next Generation Platform",
                description: "Launch of our completely redesigned platform with enhanced features, improved user experience, and expanded capabilities."
              }
            ].map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col md:flex-row gap-6"
              >
                <div className="md:w-1/6">
                  <div className="bg-blue-600 text-white text-xl font-bold rounded-lg p-4 text-center">
                    {milestone.year}
                  </div>
                </div>
                <div className="md:w-5/6">
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What People Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from students and faculty who have experienced Thapar Virtual Labs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The virtual labs have completely transformed how I understand complex engineering concepts. Being able to visualize and interact with simulations makes learning so much more effective.",
                name: "Rahul Sharma",
                role: "Computer Science Student"
              },
              {
                quote: "As a professor, I've seen a significant improvement in student engagement and understanding since we started using Thapar Virtual Labs in our curriculum.",
                name: "Dr. Priya Patel",
                role: "Associate Professor, Electrical Engineering"
              },
              {
                quote: "The platform's accessibility means I can practice lab experiments anytime, anywhere. This flexibility has been invaluable for my learning journey.",
                name: "Ananya Singh",
                role: "Mechanical Engineering Student"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="text-2xl text-blue-600 mb-4">"</div>
                    <p className="text-gray-600 mb-6 italic">{testimonial.quote}</p>
                    <div className="mt-auto">
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
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
                <li><Link href="/team" className="hover:text-white">Team</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
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