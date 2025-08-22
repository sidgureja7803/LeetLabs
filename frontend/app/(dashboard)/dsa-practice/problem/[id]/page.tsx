"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Play,
  Save,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Code as CodeIcon,
  Settings,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import CodeMirror to avoid SSR issues
const CodeEditor = dynamic(
  () => import('@/components/dsa-practice/CodeEditor'),
  { ssr: false }
);

// This will be defined in our API client
const dsaPracticeAPI = {
  getProblem: async (id: string) => {
    // Will implement actual API call later
    // Placeholder data for now
    return {
      data: {
        id,
        title: 'Two Sum',
        difficulty: 'EASY',
        category: 'Arrays',
        description: `
# Two Sum

## Problem Description
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

## Example 3:
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

## Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.
        `,
        hints: [
          "Consider using a hash map to store values you've seen",
          "For each element, check if the complement (target - nums[i]) exists in the hash map",
          "Remember to handle edge cases like duplicate elements"
        ],
        codeTemplate: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    
}`,
          python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    `,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`
        },
        testCases: [
          {
            input: "[2,7,11,15], 9",
            expected: "[0,1]",
            explanation: "nums[0] + nums[1] = 2 + 7 = 9"
          },
          {
            input: "[3,2,4], 6",
            expected: "[1,2]",
            explanation: "nums[1] + nums[2] = 2 + 4 = 6"
          },
          {
            input: "[3,3], 6",
            expected: "[0,1]",
            explanation: "nums[0] + nums[1] = 3 + 3 = 6"
          }
        ],
        solution: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
          python: `def twoSum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[] {map.get(complement), i};
            }
            
            map.put(nums[i], i);
        }
        
        return new int[] {};
    }
}`
        }
      }
    };
  },
  submitSolution: async (problemId: string, code: string, language: string) => {
    // Will implement actual API call later
    // Simulate API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Placeholder response
    return {
      success: true,
      data: {
        passed: true,
        results: [
          { testCase: 1, passed: true, output: "[0,1]", expected: "[0,1]" },
          { testCase: 2, passed: true, output: "[1,2]", expected: "[1,2]" },
          { testCase: 3, passed: true, output: "[0,1]", expected: "[0,1]" }
        ],
        executionTime: "45ms",
        memoryUsed: "40.2MB"
      }
    };
  }
};

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params.id as string;
  
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState('description');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await dsaPracticeAPI.getProblem(problemId);
        if (res.data) {
          setProblem(res.data);
          setCode(res.data.codeTemplate[language]);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  useEffect(() => {
    if (problem && problem.codeTemplate && problem.codeTemplate[language]) {
      setCode(problem.codeTemplate[language]);
    }
  }, [language, problem]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    
    try {
      const res = await dsaPracticeAPI.submitSolution(problemId, code, language);
      setResult(res.data);
    } catch (error) {
      console.error('Error submitting solution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Will implement API call to save favorite status
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thapar-blue"></div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'EASY': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HARD': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dsa-practice">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{problem.title}</h2>
          <Badge className={getDifficultyColor(problem.difficulty)}>
            {problem.difficulty}
          </Badge>
          <Badge variant="outline">{problem.category}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleFavorite}
          >
            {isFavorite ? (
              <BookmarkCheck className="h-4 w-4 text-yellow-500" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column: Problem description */}
        <div className="space-y-4">
          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
              <TabsTrigger value="solutions">Solution</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none dark:prose-invert" 
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Example Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {problem.testCases.map((testCase: any, index: number) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium">Input:</p>
                            <pre className="text-xs bg-slate-100 p-2 rounded">{testCase.input}</pre>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Expected:</p>
                            <pre className="text-xs bg-slate-100 p-2 rounded">{testCase.expected}</pre>
                          </div>
                        </div>
                        {testCase.explanation && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {testCase.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hints">
              <Card>
                <CardHeader>
                  <CardTitle>Hints</CardTitle>
                  <CardDescription>
                    Use these hints if you're stuck
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    {problem.hints.map((hint: string, index: number) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="solutions">
              <Card>
                <CardHeader>
                  <CardTitle>Solution</CardTitle>
                  <CardDescription>
                    View the optimal solution and explanation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript">
                    <TabsList className="mb-4">
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="java">Java</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="javascript">
                      <pre className="bg-slate-100 p-4 rounded overflow-x-auto">
                        <code>{problem.solution.javascript}</code>
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="python">
                      <pre className="bg-slate-100 p-4 rounded overflow-x-auto">
                        <code>{problem.solution.python}</code>
                      </pre>
                    </TabsContent>
                    
                    <TabsContent value="java">
                      <pre className="bg-slate-100 p-4 rounded overflow-x-auto">
                        <code>{problem.solution.java}</code>
                      </pre>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Approach:</h4>
                    <p>
                      This solution uses a hash map to keep track of the numbers we've seen so far.
                      For each number, we check if its complement (target - num) is already in the map.
                      If it is, we've found our answer. Otherwise, we add the current number to the map.
                    </p>
                    <h4 className="font-medium">Complexity Analysis:</h4>
                    <ul className="list-disc pl-5">
                      <li>Time Complexity: O(n) where n is the length of the array</li>
                      <li>Space Complexity: O(n) for the hash map</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column: Code editor and results */}
        <div className="space-y-4">
          <Card className="h-[calc(100%-80px)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Code Editor</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={language} 
                    onValueChange={handleLanguageChange}
                    options={[
                      { value: 'javascript', label: 'JavaScript' },
                      { value: 'python', label: 'Python' },
                      { value: 'java', label: 'Java' },
                    ]}
                  />
                  <Button variant="outline" size="sm" onClick={() => setCode(problem.codeTemplate[language])}>
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[500px]">
              <CodeEditor 
                value={code} 
                onChange={handleCodeChange}
                language={language}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleSubmit(false)}>
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
              <Button onClick={() => handleSubmit(true)} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Solution
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {result.passed ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-500">All Tests Passed!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-500">Some Tests Failed</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  Execution Time: {result.executionTime} | Memory Used: {result.memoryUsed}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.results.map((testResult: any, index: number) => (
                    <div 
                      key={index} 
                      className={`p-2 border rounded ${testResult.passed ? 'bg-green-50' : 'bg-red-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Test Case {testResult.testCase}</div>
                        {testResult.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Output: </span>
                          <code>{testResult.output}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected: </span>
                          <code>{testResult.expected}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Select component since we'll import our UI library later
function Select({ value, onValueChange, options }: { 
  value: string; 
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[]
}) {
  return (
    <select 
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="border rounded p-1 text-sm"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
