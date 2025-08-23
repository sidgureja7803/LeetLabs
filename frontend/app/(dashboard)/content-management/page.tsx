"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { contentManagementAPI } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
// Removing the separator import as it doesn't exist
import { FileUploader } from '@/components/ui/file-uploader';
import {
  PlusCircle,
  Search,
  FilePlus,
  FileText,
  FileVideo,
  Link as LinkIcon,
  BookOpen,
  MoreVertical,
  Trash,
  Edit,
  Eye,
  BookmarkPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Real API client is imported from @/lib/api

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'DOCUMENT': return <FileText className="h-4 w-4" />;
    case 'VIDEO': return <FileVideo className="h-4 w-4" />;
    case 'LINK': return <LinkIcon className="h-4 w-4" />;
    case 'MODULE': return <BookOpen className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

export default function ContentManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('browse');
  const [contents, setContents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [contentType, setContentType] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Form states for content upload
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'DOCUMENT',
    subjectId: '',
    description: '',
    visibility: 'ENROLLED',
    tags: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const res = await contentManagementAPI.getContents({
          page: currentPage,
          limit: itemsPerPage,
          type: contentType,
          search: searchTerm,
          subject: selectedSubject
        });
        
        setContents(res.data.contents);
        setTotalPages(res.data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching contents:', error);
        toast({
          title: "Error",
          description: "Failed to load content items",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchSubjects = async () => {
      try {
        const res = await contentManagementAPI.getSubjects();
        setSubjects(res.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    
    fetchContents();
    fetchSubjects();
  }, [contentType, searchTerm, selectedSubject, currentPage, itemsPerPage, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewContent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewContent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDeleteContent = async (contentId: string) => {
    try {
      await contentManagementAPI.deleteContent(contentId);
      
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      
      // Refresh content list
      const refreshedContents = await contentManagementAPI.getContents({
        page: currentPage,
        limit: itemsPerPage,
        type: contentType,
        search: searchTerm,
        subject: selectedSubject
      });
      setContents(refreshedContents.data.contents);
      setTotalPages(refreshedContents.data.pagination.totalPages);
      
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      });
    }
  };
  
  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newContent.title || !newContent.subjectId) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (newContent.type === 'LINK' && !url) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    if ((newContent.type === 'DOCUMENT' || newContent.type === 'VIDEO') && !file) {
      toast({
        title: "Validation Error",
        description: "Please upload a file",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadLoading(true);
      
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('title', newContent.title);
      formData.append('type', newContent.type);
      formData.append('subjectId', newContent.subjectId);
      formData.append('visibility', newContent.visibility);
      
      if (newContent.description) {
        formData.append('description', newContent.description);
      }
      
      if (newContent.tags) {
        const tagsArray = newContent.tags.split(',').map(tag => tag.trim());
        formData.append('tags', JSON.stringify(tagsArray));
      }
      
      if (newContent.type === 'LINK' && url) {
        formData.append('url', url);
      }
      
      if ((newContent.type === 'DOCUMENT' || newContent.type === 'VIDEO') && file) {
        formData.append('file', file);
        formData.append('fileSize', file.size.toString());
        formData.append('format', file.type);
      }
      
      const res = await contentManagementAPI.createContent(formData);
      
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      
      // Reset form
      setNewContent({
        title: '',
        type: 'DOCUMENT',
        subjectId: '',
        description: '',
        visibility: 'ENROLLED',
        tags: ''
      });
      setFile(null);
      setUrl('');
      
      // Switch to browse tab
      setActiveTab('browse');
      
      // Refresh content list
      const refreshedContents = await contentManagementAPI.getContents({
        page: currentPage,
        limit: itemsPerPage,
        type: contentType,
        search: searchTerm,
        subject: selectedSubject
      });
      setContents(refreshedContents.data.contents);
      setTotalPages(refreshedContents.data.pagination.totalPages);
      
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
        <Button onClick={() => setActiveTab('upload')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="browse">Browse Content</TabsTrigger>
          <TabsTrigger value="upload">Upload Content</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>
                Browse and manage educational content for your courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="DOCUMENT">Documents</SelectItem>
                    <SelectItem value="VIDEO">Videos</SelectItem>
                    <SelectItem value="LINK">Links</SelectItem>
                    <SelectItem value="MODULE">Modules</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue" />
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of all learning content</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {getContentTypeIcon(content.type)}
                            <span>{content.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {content.tags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="mr-1 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={content.type === 'DOCUMENT' ? 'default' : 
                                         content.type === 'VIDEO' ? 'secondary' :
                                         content.type === 'LINK' ? 'outline' : 'destructive'}>
                            {content.type}
                          </Badge>
                          {content.format && <div className="text-xs mt-1">{content.format}</div>}
                        </TableCell>
                        <TableCell>{content.subject}</TableCell>
                        <TableCell>{content.uploadedBy}</TableCell>
                        <TableCell>{new Date(content.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/content-management/content/${content.id}`}>
                                  <div className="flex items-center">
                                    <Eye className="h-4 w-4 mr-2" /> View
                                  </div>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/content-management/content/${content.id}/edit`}>
                                  <div className="flex items-center">
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                  </div>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteContent(content.id)}>
                                <Trash className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {contents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No content found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Content</CardTitle>
              <CardDescription>Add new learning materials to your courses</CardDescription>
            </CardHeader>
            <form onSubmit={handleContentSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      name="title"
                      value={newContent.title}
                      onChange={handleInputChange}
                      placeholder="Enter content title" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Content Type</Label>
                    <Select 
                      value={newContent.type} 
                      onValueChange={(value: string) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="LINK">External Link</SelectItem>
                        <SelectItem value="MODULE">Learning Module</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={newContent.subjectId} 
                    onValueChange={(value: string) => handleSelectChange('subjectId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={newContent.description}
                    onChange={handleInputChange}
                    placeholder="Describe this content" 
                    className="min-h-[100px]"
                  />
                </div>

                {newContent.type === 'LINK' ? (
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input 
                      id="url" 
                      name="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://" 
                      type="url"
                      required 
                    />
                  </div>
                ) : newContent.type !== 'MODULE' && (
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File</Label>
                    <FileUploader 
                      onFileSelect={handleFileChange}
                      acceptedFileTypes={
                        newContent.type === 'DOCUMENT' 
                          ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf"
                          : ".mp4,.webm,.mov,.avi"
                      }
                      maxSizeMB={50}
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select 
                      value={newContent.visibility} 
                      onValueChange={(value: string) => handleSelectChange('visibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="ENROLLED">Enrolled Students Only</SelectItem>
                        <SelectItem value="PRIVATE">Private (Teachers Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input 
                      id="tags" 
                      name="tags"
                      value={newContent.tags}
                      onChange={handleInputChange}
                      placeholder="e.g. notes, lecture, important" 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={uploadLoading}>
                  {uploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FilePlus className="mr-2 h-4 w-4" />
                      Upload Content
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
