"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  FileVideo,
  Link as LinkIcon,
  BookOpen,
  Download,
  Edit,
  Share,
  ArrowLeft,
  BookmarkPlus,
  ThumbsUp,
  MessageSquare,
  Eye
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

// Mock API for content detail
const contentManagementAPI = {
  getContentById: async (id: string) => {
    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    return {
      data: {
        id,
        title: id === '1' ? 'Introduction to Data Structures' : 'Advanced Programming Concepts',
        type: id === '1' ? 'DOCUMENT' : 'VIDEO',
        format: id === '1' ? 'PDF' : 'MP4',
        fileSize: id === '1' ? '1.2 MB' : '45.6 MB',
        uploadedBy: id === '1' ? 'Dr. John Smith' : 'Prof. Michael Lee',
        createdAt: '2025-08-15T10:30:00Z',
        subject: id === '1' ? 'Data Structures and Algorithms' : 'Advanced Programming',
        subjectId: id === '1' ? 's1' : 's6',
        visibility: 'PUBLIC',
        description: id === '1' 
          ? 'An introductory guide to understanding data structures including arrays, linked lists, stacks, queues, trees, and graphs. This document covers the basic concepts, implementations, and common operations with complexity analysis.' 
          : 'This video tutorial covers advanced programming concepts including functional programming, metaprogramming, concurrency patterns, and design principles for scalable applications.',
        downloadUrl: '#',
        url: id === '1' ? undefined : 'https://example.com/videos/advanced-programming',
        tags: id === '1' ? ['beginner', 'notes', 'fundamental'] : ['advanced', 'video', 'tutorial'],
        duration: id === '1' ? undefined : '18:25',
        views: 245,
        downloads: 87,
        likes: 32,
        comments: [
          {
            id: 'c1',
            userId: 'u1',
            userName: 'Sarah Parker',
            userAvatar: '/avatar-1.png',
            content: 'This was incredibly helpful for my project, thank you!',
            createdAt: '2025-08-17T14:23:00Z',
            likes: 4
          },
          {
            id: 'c2',
            userId: 'u2',
            userName: 'James Wilson',
            userAvatar: '/avatar-2.png',
            content: 'Could you please provide more examples for the graph algorithms section?',
            createdAt: '2025-08-16T09:45:00Z',
            likes: 2
          }
        ],
        relatedContent: [
          {
            id: '3',
            title: 'Data Structures Practice Problems',
            type: 'DOCUMENT'
          },
          {
            id: '4',
            title: 'Algorithm Visualization Tools',
            type: 'LINK'
          },
          {
            id: '5',
            title: 'Advanced Data Structures',
            type: 'MODULE'
          }
        ]
      }
    };
  }
};

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'DOCUMENT': return <FileText className="h-5 w-5" />;
    case 'VIDEO': return <FileVideo className="h-5 w-5" />;
    case 'LINK': return <LinkIcon className="h-5 w-5" />;
    case 'MODULE': return <BookOpen className="h-5 w-5" />;
    default: return <FileText className="h-5 w-5" />;
  }
};

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const id = params.id as string;
        const res = await contentManagementAPI.getContentById(id);
        setContent(res.data);
      } catch (error) {
        console.error('Error fetching content details:', error);
        toast({
          title: "Error",
          description: "Failed to load content details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [params.id, toast]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thapar-blue" />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Content Not Found</h3>
              <p className="text-muted-foreground mb-4">The requested content could not be found</p>
              <Button onClick={() => router.push('/content-management')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Content Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/content-management')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight flex-1">{content.title}</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Content
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {getContentTypeIcon(content.type)}
                    <Badge variant={
                      content.type === 'DOCUMENT' ? 'default' : 
                      content.type === 'VIDEO' ? 'secondary' :
                      content.type === 'LINK' ? 'outline' : 'destructive'
                    }>
                      {content.type}
                    </Badge>
                    {content.format && (
                      <Badge variant="outline">{content.format}</Badge>
                    )}
                  </div>
                  
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                    {content.type === 'MODULE' && (
                      <TabsTrigger value="contents">Contents</TabsTrigger>
                    )}
                  </TabsList>
                </div>
                
                <CardDescription className="flex items-center mt-2">
                  <span className="flex items-center text-sm">
                    <Eye className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    {content.views} views
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center text-sm">
                    <Download className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    {content.downloads} downloads
                  </span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">
                    Added {new Date(content.createdAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </CardHeader>

              <TabsContent value="details" className="m-0">
                <CardContent className="pt-0">
                  {content.type === 'VIDEO' && (
                    <div className="aspect-video bg-muted rounded-md mb-6 flex items-center justify-center">
                      <FileVideo className="h-20 w-20 text-muted-foreground/40" />
                    </div>
                  )}
                  
                  {content.type === 'DOCUMENT' && (
                    <div className="aspect-[4/5] max-h-[500px] bg-muted rounded-md mb-6 flex items-center justify-center">
                      <FileText className="h-20 w-20 text-muted-foreground/40" />
                    </div>
                  )}
                  
                  {content.type === 'LINK' && content.url && (
                    <div className="rounded-md border p-4 mb-6 bg-muted/40">
                      <div className="flex items-center mb-2">
                        <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="text-blue-500 underline">{content.url}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">External link to resource</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">{content.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 my-4">
                      {content.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Subject</h4>
                        <p className="text-sm text-muted-foreground">{content.subject}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Uploaded By</h4>
                        <p className="text-sm text-muted-foreground">{content.uploadedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">File Size</h4>
                        <p className="text-sm text-muted-foreground">{content.fileSize}</p>
                      </div>
                      {content.duration && (
                        <div>
                          <h4 className="text-sm font-medium">Duration</h4>
                          <p className="text-sm text-muted-foreground">{content.duration}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Like
                    </Button>
                  </div>
                  
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="discussion" className="m-0">
                <CardContent className="pt-0 pb-6">
                  <h3 className="text-lg font-medium mb-4">Discussion ({content.comments?.length || 0})</h3>
                  
                  {content.comments && content.comments.length > 0 ? (
                    <div className="space-y-6">
                      {content.comments.map((comment: any) => (
                        <div key={comment.id} className="flex space-x-4">
                          <Avatar>
                            <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                            <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{comment.userName}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Button variant="ghost" size="sm" className="h-auto p-0">
                                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                {comment.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-auto p-0">
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">
                      No comments yet. Be the first to start a discussion!
                    </p>
                  )}
                </CardContent>
              </TabsContent>

              <TabsContent value="contents" className="m-0">
                <CardContent className="pt-0">
                  <h3 className="text-lg font-medium mb-4">Module Contents</h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div 
                        key={item}
                        className="flex items-center p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="mr-3 p-2 bg-primary/10 rounded">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">
                            {item}. {content.title} - Part {item}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            PDF • 2.1 MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Related Content</CardTitle>
              <CardDescription>
                Similar materials from this subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              {content.relatedContent && content.relatedContent.length > 0 ? (
                <div className="space-y-4">
                  {content.relatedContent.map((item: any) => (
                    <Link 
                      key={item.id} 
                      href={`/content-management/content/${item.id}`}
                      className="flex items-center p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer block"
                    >
                      <div className="mr-3 p-2 bg-primary/10 rounded">
                        {getContentTypeIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.type}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No related content available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
