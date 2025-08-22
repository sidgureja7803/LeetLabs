"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Code, BookOpen, Rocket, Clock, CheckCircle, Award } from 'lucide-react';
import Link from 'next/link';

// This will be defined in our API client
const dsaPracticeAPI = {
  getProblems: async ({ difficulty, category, search }: { difficulty?: string, category?: string, search?: string }) => {
    // Will implement API call later
    // Placeholder data for now
    return {
      data: {
        problems: [
          {
            id: 'prob1',
            title: 'Two Sum',
            difficulty: 'EASY',
            category: 'Arrays',
            completedByUser: false,
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
          },
          {
            id: 'prob2',
            title: 'Linked List Cycle',
            difficulty: 'MEDIUM',
            category: 'Linked Lists',
            completedByUser: true,
            description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.'
          },
          {
            id: 'prob3',
            title: 'Binary Tree Level Order Traversal',
            difficulty: 'MEDIUM',
            category: 'Trees',
            completedByUser: false,
            description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values.'
          },
          {
            id: 'prob4',
            title: 'Merge K Sorted Lists',
            difficulty: 'HARD',
            category: 'Linked Lists',
            completedByUser: false,
            description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.'
          },
          {
            id: 'prob5',
            title: 'Valid Parentheses',
            difficulty: 'EASY',
            category: 'Stacks',
            completedByUser: true,
            description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.'
          },
        ],
        stats: {
          totalProblems: 120,
          completedProblems: 24,
          easyProblems: 40,
          mediumProblems: 55,
          hardProblems: 25,
        }
      }
    };
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch(difficulty) {
    case 'EASY': return 'bg-green-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'HARD': return 'bg-red-500';
    default: return 'bg-blue-500';
  }
};

export default function DSAPracticePage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProblems: 0,
    completedProblems: 0,
    easyProblems: 0,
    mediumProblems: 0,
    hardProblems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problems');
  
  // Filters
  const [difficulty, setDifficulty] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await dsaPracticeAPI.getProblems({
          difficulty,
          category,
          search: searchTerm
        });
        
        if (res.data) {
          setProblems(res.data.problems);
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error('Error fetching DSA problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [difficulty, category, searchTerm]);

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
        <h2 className="text-3xl font-bold tracking-tight">DSA Practice</h2>
        <Button asChild>
          <Link href="/dsa-practice/random">Practice Random Problem</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProblems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProblems}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completedProblems / stats.totalProblems) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty Distribution</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Easy</span>
              <Badge className="bg-green-500">{stats.easyProblems}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Medium</span>
              <Badge className="bg-yellow-500">{stats.mediumProblems}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Hard</span>
              <Badge className="bg-red-500">{stats.hardProblems}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Achievement</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">5 Day Streak!</div>
            <p className="text-xs text-muted-foreground">Keep practicing daily</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="problems" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="problems">All Problems</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="favorite">Favorite</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DSA Problems</CardTitle>
              <CardDescription>Practice data structures and algorithms problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search problems..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Arrays">Arrays</SelectItem>
                    <SelectItem value="Strings">Strings</SelectItem>
                    <SelectItem value="Linked Lists">Linked Lists</SelectItem>
                    <SelectItem value="Trees">Trees</SelectItem>
                    <SelectItem value="Graphs">Graphs</SelectItem>
                    <SelectItem value="Dynamic Programming">Dynamic Programming</SelectItem>
                    <SelectItem value="Stacks">Stacks</SelectItem>
                    <SelectItem value="Queues">Queues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                {problems.length > 0 ? (
                  problems.map((problem) => (
                    <div 
                      key={problem.id}
                      className="p-4 border rounded-md hover:bg-slate-50 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <Link href={`/dsa-practice/problem/${problem.id}`}>
                          <h3 className="font-medium hover:text-blue-600 transition-colors">
                            {problem.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                          {problem.completedByUser && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {problem.category} • {problem.description.substring(0, 100)}...
                      </p>
                      <div className="flex justify-end mt-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dsa-practice/problem/${problem.id}`}>Solve</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p>No problems found matching your criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs will be implemented similarly */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Problems</CardTitle>
              <CardDescription>Problems you have successfully solved</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View your completed problems here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Problems</CardTitle>
              <CardDescription>Problems you have marked as favorite</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View your favorite problems here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommended" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Problems</CardTitle>
              <CardDescription>Problems tailored to your skill level</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View recommended problems based on your progress</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
