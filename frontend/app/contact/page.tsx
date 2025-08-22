'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Simulate API call
    try {
      // In a real application, you would send the form data to your backend
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formState)
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-2xl text-blue-100">
            Have questions or feedback? We'd love to hear from you. Reach out to our team using the form below.
          </p>
        </div>
      </header>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                We're here to answer any questions you may have about our virtual labs, courses, or how to get started. Feel free to reach out to us using any of the methods below.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Email Us</h3>
                    <p className="text-gray-600">info@thapar.edu</p>
                    <p className="text-gray-600">support@thaparvirtuallabs.edu</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Call Us</h3>
                    <p className="text-gray-600">+91 175 2393021</p>
                    <p className="text-gray-600">+91 175 2393022</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Visit Us</h3>
                    <p className="text-gray-600">Thapar Institute of Engineering and Technology</p>
                    <p className="text-gray-600">P.O. Box 32, Patiala, Punjab 147004, India</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Monday - Friday</p>
                      <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                    </div>
                    <div>
                      <p className="font-medium">Saturday</p>
                      <p className="text-gray-600">9:00 AM - 1:00 PM</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">Sunday</p>
                      <p className="text-gray-600">Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card>
                <CardContent className="p-6">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                      <p className="text-gray-600 mb-6">
                        Your message has been sent successfully. We'll get back to you as soon as possible.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                      
                      {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                          {error}
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formState.email}
                            onChange={handleChange}
                            placeholder="john.doe@example.com"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            name="subject"
                            value={formState.subject}
                            onChange={handleChange}
                            placeholder="How can we help you?"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formState.message}
                            onChange={handleChange}
                            placeholder="Your message here..."
                            rows={5}
                            required
                          />
                        </div>
                        
                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </span>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Find Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Located in the heart of Patiala, our campus is easily accessible from all major transportation hubs.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-video bg-white rounded-lg shadow-md flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🗺️</div>
                <p>Interactive Map Would Be Displayed Here</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our virtual labs and services.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How do I access the virtual labs?",
                answer: "You can access our virtual labs by logging into your student account on our platform. Once logged in, navigate to the 'Labs' section to see all available virtual laboratories for your courses."
              },
              {
                question: "Do I need special software to use the virtual labs?",
                answer: "No, our virtual labs are web-based and can be accessed through any modern web browser. You don't need to install any additional software to use them."
              },
              {
                question: "Are the virtual labs available 24/7?",
                answer: "Yes, our virtual labs are available 24 hours a day, 7 days a week. You can access them anytime from anywhere with an internet connection."
              },
              {
                question: "How do I get technical support for the virtual labs?",
                answer: "If you encounter any technical issues, you can contact our support team through the 'Help' section on the platform, or by emailing support@thaparvirtuallabs.edu."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
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