"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, BookOpen, User, FileText, Calendar, Upload, PlusCircle, Book, File } from 'lucide-react';
// Mock API
const teacherAPI = {
  getDashboard: () => Promise.resolve({ data: null })
};

// Define types for our dashboard data
type Subject = {
  id: string;
  name: string;
  code: string;
  department?: { name: string };
  semester: number;
  assignments?: any[];
  materials: Material[];
};

type Material = {
  id: string;
  title: string;
  type: 'DOCUMENT' | 'PRESENTATION' | 'VIDEO' | 'LINK';
  description: string;
  url?: string;
  uploadDate: string;
};

type DashboardData = {
  teacher: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  stats: {
    totalSubjects: number;
    totalAssignments: number;
    totalSubmissions: number;
    pendingGrading: number;
  };
  subjects: Subject[];
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    teacher: {
      id: '',
      name: '',
      email: '',
      department: ''
    },
    stats: {
      totalSubjects: 0,
      totalAssignments: 0,
      totalSubmissions: 0,
      pendingGrading: 0
    },
    subjects: []
  });
  
  // States for content upload dialog
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [newMaterial, setNewMaterial] = useState<{
    title: string;
    type: 'DOCUMENT' | 'PRESENTATION' | 'VIDEO' | 'LINK';
    description: string;
    url: string;
  }>({
    title: '',
    type: 'DOCUMENT',
    description: '',
    url: ''
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock dashboard data
    const mockDashboardData: DashboardData = {
      teacher: {
        id: '1',
        name: 'Dr. Anita Sharma',
        email: 'teacher@thapar.edu',
        department: 'Computer Science'
      },
      stats: {
        totalSubjects: 5,
        totalAssignments: 10,
        totalSubmissions: 45,
        pendingGrading: 12
      },
      subjects: [
        {
          id: '1',
          name: 'Operating Systems',
          code: 'CS301',
          department: { name: 'Computer Science' },
          semester: 3,
          assignments: [{ id: '1', title: 'Process Scheduling Implementation' }],
          materials: [
            {
              id: '1',
              title: 'Introduction to OS',
              type: 'PRESENTATION',
              description: 'Overview of operating systems concepts',
              url: '/materials/intro-to-os.pptx',
              uploadDate: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Process Management',
              type: 'DOCUMENT',
              description: 'Detailed notes on process management and scheduling',
              url: '/materials/process-mgmt.pdf',
              uploadDate: new Date().toISOString()
            }
          ]
        },
        {
          id: '2',
          name: 'Numerical Analysis',
          code: 'MA301',
          department: { name: 'Mathematics' },
          semester: 3,
          assignments: [{ id: '2', title: 'Newton-Raphson Method Analysis' }],
          materials: [
            {
              id: '3',
              title: 'Introduction to Numerical Methods',
              type: 'DOCUMENT',
              description: 'Overview of numerical analysis techniques',
              url: '/materials/intro-numerical.pdf',
              uploadDate: new Date().toISOString()
            }
          ]
        },
        {
          id: '3',
          name: 'Data Structures and Algorithms',
          code: 'CS302',
          department: { name: 'Computer Science' },
          semester: 3,
          assignments: [{ id: '3', title: 'AVL Trees Implementation' }],
          materials: [
            {
              id: '4',
              title: 'Binary Trees and BST',
              type: 'PRESENTATION',
              description: 'Understanding tree data structures',
              url: '/materials/binary-trees.pptx',
              uploadDate: new Date().toISOString()
            },
            {
              id: '5',
              title: 'Sorting Algorithms',
              type: 'VIDEO',
              description: 'Video lecture on sorting algorithms',
              url: 'https://example.com/video/sorting',
              uploadDate: new Date().toISOString()
            }
          ]
        },
        {
          id: '4',
          name: 'Engineering Materials',
          code: 'ME201',
          department: { name: 'Mechanical Engineering' },
          semester: 3,
          assignments: [{ id: '4', title: 'Material Properties Analysis' }],
          materials: [
            {
              id: '6',
              title: 'Material Properties',
              type: 'DOCUMENT',
              description: 'Reference document for material properties',
              url: '/materials/material-properties.pdf',
              uploadDate: new Date().toISOString()
            }
          ]
        },
        {
          id: '5',
          name: 'Discrete Mathematics',
          code: 'MA302',
          department: { name: 'Mathematics' },
          semester: 3,
          assignments: [{ id: '5', title: 'Graph Theory Proofs' }],
          materials: [
            {
              id: '7',
              title: 'Graph Theory Basics',
              type: 'DOCUMENT',
              description: 'Introduction to graph theory',
              url: '/materials/graph-theory.pdf',
              uploadDate: new Date().toISOString()
            }
          ]
        }
      ]
    };
    
    // Set mock data instead of fetching from API
    setDashboardData(mockDashboardData);
    setLoading(false);
  }, []);
  
  // Handle adding new material
  const handleAddMaterial = (subject: Subject) => {
    setSelectedSubject(subject);
    setNewMaterial({
      title: '',
      type: 'DOCUMENT',
      description: '',
      url: ''
    });
    setUploadDialogOpen(true);
  };
  
  // Handle saving the new material
  const handleSaveMaterial = () => {
    if (!selectedSubject) return;
    
    // Create a new material object
    const material: Material = {
      id: `new-${Date.now()}`,
      title: newMaterial.title,
      type: newMaterial.type,
      description: newMaterial.description,
      url: newMaterial.url,
      uploadDate: new Date().toISOString()
    };
    
    // Update the selected subject with the new material
    const updatedSubjects = dashboardData.subjects.map(subject => {
      if (subject.id === selectedSubject.id) {
        return {
          ...subject,
          materials: [...subject.materials, material]
        };
      }
      return subject;
    });
    
    // Update the dashboard data
    setDashboardData({
      ...dashboardData,
      subjects: updatedSubjects
    });
    
    // Close the dialog
    setUploadDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
      </div>

      {/* Teacher Profile Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-blue-100 rounded-full p-6">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{dashboardData.teacher.name}</h3>
              <p className="text-gray-500">{dashboardData.teacher.email}</p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary">{dashboardData.teacher.department}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subjects
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalSubjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.pendingGrading}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Overview with Materials */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects">My Teaching Subjects</TabsTrigger>
          <TabsTrigger value="materials">Course Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subjects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Teaching Subjects</CardTitle>
              <CardDescription>Courses you are currently teaching this semester</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.subjects.length === 0 ? (
                <p className="text-muted-foreground">No subjects assigned yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.subjects.map((subject) => (
                    <Card key={subject.id} className="overflow-hidden border shadow-md">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                        <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                        <p className="text-blue-100 text-sm">{subject.code}</p>
                      </div>
                      <CardContent className="p-4">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Department:</span>
                            <span className="font-medium">{subject.department?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Semester:</span>
                            <span className="font-medium">{subject.semester}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assignments:</span>
                            <span className="font-medium">{subject.assignments?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Materials:</span>
                            <span className="font-medium">{subject.materials?.length || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="materials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
              <CardDescription>Add and manage learning materials for your courses</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.subjects.map((subject) => (
                <Card key={subject.id} className="mb-6">
                  <CardHeader className="bg-muted">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{subject.name} ({subject.code})</CardTitle>
                      <Button onClick={() => handleAddMaterial(subject)} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Material
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {subject.materials.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No materials added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {subject.materials.map((material) => (
                          <Card key={material.id} className="border shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-2 rounded-md">
                                  {material.type === 'DOCUMENT' && <FileText className="h-6 w-6 text-blue-600" />}
                                  {material.type === 'PRESENTATION' && <Book className="h-6 w-6 text-blue-600" />}
                                  {material.type === 'VIDEO' && <File className="h-6 w-6 text-blue-600" />}
                                  {material.type === 'LINK' && <File className="h-6 w-6 text-blue-600" />}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{material.title}</h4>
                                  <p className="text-sm text-muted-foreground">{material.description}</p>
                                  <div className="flex justify-between items-center mt-2">
                                    <Badge variant="outline">{material.type}</Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(material.uploadDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for adding new material */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>
              {selectedSubject && `Add learning material for ${selectedSubject.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                placeholder="Material title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select 
                id="type"
                value={newMaterial.type}
                onChange={(e) => {
                  const value = e.target.value as 'DOCUMENT' | 'PRESENTATION' | 'VIDEO' | 'LINK';
                  setNewMaterial({...newMaterial, type: value});
                }}
                className="w-full p-2 border rounded-md">
                <option value="DOCUMENT">Document (PDF)</option>
                <option value="PRESENTATION">Presentation (PPT/PPTX)</option>
                <option value="VIDEO">Video</option>
                <option value="LINK">External Link</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                placeholder="Brief description of the material"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="url">File URL or Web Link</Label>
              <Input
                id="url"
                value={newMaterial.url}
                onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                placeholder="URL or file path"
              />
              <p className="text-xs text-muted-foreground">
                For demonstration, enter any path or URL. In a real application, you would upload a file here.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMaterial}>Save Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
