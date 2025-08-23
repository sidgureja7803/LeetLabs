"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, GitHub, Linkedin, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Team member interface
interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  links?: {
    github?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

// Team data
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Siddhant Gureja",
    role: "Fulll Stack Web Developer",
    bio: "Dr. Kumar is a Professor of Computer Science with over 15 years of experience in educational technology. He leads the development of Thapar Virtual Labs.",
    image: "/assets/team/mentor1.jpg",
    links: {
      email: "sgureja_be22@thapar.edu",
      linkedin: "https://linkedin.com/in/rajeshkumar"
    }
  },
  {
    id: 2,
    name: "Manan Malik",
    role: "Devops and Backend",
    bio: "Dr. Singh oversees the academic integration of virtual labs into the curriculum, ensuring they meet educational standards and objectives.",
    image: "/assets/team/mentor2.jpg",
    links: {
      email: "mmlaik@thapar.edu",
      linkedin: "https://linkedin.com/in/priyasingh"
    }
  },
  {
    id: 3,
    name: "Gunheer Ahuja",
    role: "UI / UX and Frontend",
    bio: "Amit leads the technical development team, focusing on the architecture and implementation of the platform's core features.",
    image: "/assets/team/developer1.jpg",
    links: {
      github: "https://github.com/amitsharma",
      linkedin: "https://linkedin.com/in/amitsharma",
      email: "gkaur4_be22@thapar.edu"
    }
  },
  {
    id: 4,
    name: "Neha Patel",
    role: "Frontend Developer",
    bio: "Neha specializes in creating intuitive and accessible user interfaces, focusing on the student and teacher experience.",
    image: "/assets/team/developer2.jpg",
    links: {
      github: "https://github.com/nehapatel",
      linkedin: "https://linkedin.com/in/nehapatel"
    }
  },
  {
    id: 5,
    name: "Vikram Mehta",
    role: "Backend Developer",
    bio: "Vikram works on the server-side architecture, database design, and API development for the platform.",
    image: "/assets/team/developer3.jpg",
    links: {
      github: "https://github.com/vikrammehta",
      linkedin: "https://linkedin.com/in/vikrammehta"
    }
  },
  {
    id: 6,
    name: "Ananya Gupta",
    role: "UX/UI Designer",
    bio: "Ananya creates the visual design and user experience for the platform, ensuring it's both beautiful and functional.",
    image: "/assets/team/designer1.jpg",
    links: {
      linkedin: "https://linkedin.com/in/ananyagupta",
      website: "https://ananyagupta.design"
    }
  }
];

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

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
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Our Team</h1>
          <p className="text-xl max-w-2xl text-blue-100">
            Meet the dedicated team behind Thapar Virtual Labs, working to transform engineering education through innovative virtual laboratory experiences.
          </p>
        </div>
      </header>

      {/* Team Members Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-64 w-full bg-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-0 left-0 p-4 z-20 text-white">
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-sm text-white/80">{member.role}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    
                    {/* Social Links */}
                    {member.links && (
                      <div className="flex space-x-3">
                        {member.links.github && (
                          <a href={member.links.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                            <GitHub className="h-5 w-5" />
                          </a>
                        )}
                        {member.links.linkedin && (
                          <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {member.links.email && (
                          <a href={`mailto:${member.links.email}`} className="text-gray-500 hover:text-red-500">
                            <Mail className="h-5 w-5" />
                          </a>
                        )}
                        {member.links.website && (
                          <a href={member.links.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-600">
                            <Globe className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              We're always looking for talented individuals to join our mission of transforming engineering education through technology.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Open Positions
            </Button>
          </motion.div>
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
                <li><Link href="#" className="hover:text-white">About</Link></li>
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
            <p>&copy; 2025 Thapar Institute of Engineering and Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
