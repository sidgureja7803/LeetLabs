import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../../middlewares/error.middleware';
import { CustomError } from '../../middlewares/error.middleware';

const prisma = new PrismaClient();

/**
 * @desc    Get all DSA categories
 * @route   GET /api/dsa-practice/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.dSACategory.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

/**
 * @desc    Get a category by ID
 * @route   GET /api/dsa-practice/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.dSACategory.findUnique({
    where: { id },
    include: {
      problems: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          difficulty: true,
          slug: true,
          tags: true,
          isPopular: true,
        },
      },
    },
  });

  if (!category) {
    throw new CustomError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Create a new DSA category
 * @route   POST /api/dsa-practice/categories
 * @access  Private (Admin)
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, iconName } = req.body;

  if (!name) {
    throw new CustomError('Name is required', 400);
  }

  const existingCategory = await prisma.dSACategory.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new CustomError('Category with this name already exists', 400);
  }

  const category = await prisma.dSACategory.create({
    data: {
      name,
      description,
      iconName,
    },
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Update a DSA category
 * @route   PUT /api/dsa-practice/categories/:id
 * @access  Private (Admin)
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, iconName, isActive } = req.body;

  const existingCategory = await prisma.dSACategory.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new CustomError('Category not found', 404);
  }

  const category = await prisma.dSACategory.update({
    where: { id },
    data: {
      name: name !== undefined ? name : existingCategory.name,
      description: description !== undefined ? description : existingCategory.description,
      iconName: iconName !== undefined ? iconName : existingCategory.iconName,
      isActive: isActive !== undefined ? isActive : existingCategory.isActive,
    },
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Delete a DSA category
 * @route   DELETE /api/dsa-practice/categories/:id
 * @access  Private (Admin)
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingCategory = await prisma.dSACategory.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new CustomError('Category not found', 404);
  }

  // Check if there are problems associated with this category
  const problemsCount = await prisma.dSAProblem.count({
    where: { categoryId: id },
  });

  if (problemsCount > 0) {
    throw new CustomError('Cannot delete category with associated problems', 400);
  }

  await prisma.dSACategory.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Get all DSA problems
 * @route   GET /api/dsa-practice/problems
 * @access  Public
 */
export const getProblems = asyncHandler(async (req: Request, res: Response) => {
  const {
    difficulty,
    category,
    search,
    tags,
    page = 1,
    limit = 10,
    sortBy = 'title',
    sortOrder = 'asc',
  } = req.query;

  // Build filter conditions
  const where: any = {
    isPublished: true,
  };

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (category) {
    where.categoryId = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (tags) {
    const tagList = (tags as string).split(',');
    where.tags = {
      hasSome: tagList,
    };
  }

  // Calculate pagination
  const skip = (+page - 1) * +limit;

  // Get total count for pagination
  const totalCount = await prisma.dSAProblem.count({ where });

  // Get problems with pagination and sorting
  const problems = await prisma.dSAProblem.findMany({
    where,
    select: {
      id: true,
      title: true,
      difficulty: true,
      slug: true,
      tags: true,
      isPopular: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          userSolutions: true,
        },
      },
    },
    orderBy: {
      [sortBy as string]: sortOrder,
    },
    skip,
    take: +limit,
  });

  // Calculate statistics by difficulty
  const stats = await prisma.$transaction([
    prisma.dSAProblem.count({ where: { isPublished: true } }),
    prisma.dSAProblem.count({ where: { isPublished: true, difficulty: 'EASY' } }),
    prisma.dSAProblem.count({ where: { isPublished: true, difficulty: 'MEDIUM' } }),
    prisma.dSAProblem.count({ where: { isPublished: true, difficulty: 'HARD' } }),
  ]);

  // For authenticated users, add completion status
  let problemsWithUserStatus = problems;
  const user = (req as any).user;

  if (user) {
    const userSolutions = await prisma.dSASolution.findMany({
      where: {
        userId: user.id,
        status: 'ACCEPTED',
        problem: {
          id: {
            in: problems.map(p => p.id),
          },
        },
      },
      select: {
        problemId: true,
      },
    });

    const completedProblemIds = new Set(userSolutions.map(s => s.problemId));

    problemsWithUserStatus = problems.map(problem => ({
      ...problem,
      completedByUser: completedProblemIds.has(problem.id),
    }));
  }

  res.status(200).json({
    success: true,
    data: {
      problems: problemsWithUserStatus,
      pagination: {
        page: +page,
        limit: +limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / +limit),
      },
      stats: {
        totalProblems: stats[0],
        easyProblems: stats[1],
        mediumProblems: stats[2],
        hardProblems: stats[3],
      },
    },
  });
});

/**
 * @desc    Get a problem by ID or slug
 * @route   GET /api/dsa-practice/problems/:idOrSlug
 * @access  Public
 */
export const getProblemByIdOrSlug = asyncHandler(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;

  // Try to find by ID first, then by slug
  let problem = await prisma.dSAProblem.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
      isPublished: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!problem) {
    throw new CustomError('Problem not found', 404);
  }

  // For authenticated users, check if they've completed this problem
  const user = (req as any).user;
  let userSolution = null;

  if (user) {
    userSolution = await prisma.dSASolution.findFirst({
      where: {
        userId: user.id,
        problemId: problem.id,
        status: 'ACCEPTED',
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        id: true,
        code: true,
        language: true,
        status: true,
        submittedAt: true,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      ...problem,
      completedByUser: !!userSolution,
      userSolution,
    },
  });
});

/**
 * @desc    Create a new DSA problem
 * @route   POST /api/dsa-practice/problems
 * @access  Private (Admin)
 */
export const createProblem = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    description,
    difficulty,
    categoryId,
    timeComplexity,
    spaceComplexity,
    hints,
    sampleTestCases,
    hiddenTestCases,
    codeTemplates,
    solutions,
    tags,
    isPublished,
    isPopular,
    slug,
  } = req.body;

  // Validate required fields
  if (!title || !description || !categoryId || !slug) {
    throw new CustomError('Missing required fields', 400);
  }

  // Check if category exists
  const categoryExists = await prisma.dSACategory.findUnique({
    where: { id: categoryId },
  });

  if (!categoryExists) {
    throw new CustomError('Category not found', 404);
  }

  // Check if slug is unique
  const existingSlug = await prisma.dSAProblem.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new CustomError('Slug must be unique', 400);
  }

  // Create the problem
  const problem = await prisma.dSAProblem.create({
    data: {
      title,
      description,
      difficulty: difficulty || 'EASY',
      categoryId,
      timeComplexity,
      spaceComplexity,
      hints,
      sampleTestCases,
      hiddenTestCases,
      codeTemplates,
      solutions,
      tags: tags || [],
      isPublished: isPublished || false,
      isPopular: isPopular || false,
      slug,
    },
  });

  res.status(201).json({
    success: true,
    data: problem,
  });
});

/**
 * @desc    Update a DSA problem
 * @route   PUT /api/dsa-practice/problems/:id
 * @access  Private (Admin)
 */
export const updateProblem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingProblem = await prisma.dSAProblem.findUnique({
    where: { id },
  });

  if (!existingProblem) {
    throw new CustomError('Problem not found', 404);
  }

  // Check if slug is unique when updating
  if (updateData.slug && updateData.slug !== existingProblem.slug) {
    const existingSlug = await prisma.dSAProblem.findUnique({
      where: { slug: updateData.slug },
    });

    if (existingSlug) {
      throw new CustomError('Slug must be unique', 400);
    }
  }

  // Update the problem
  const problem = await prisma.dSAProblem.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    data: problem,
  });
});

/**
 * @desc    Delete a DSA problem
 * @route   DELETE /api/dsa-practice/problems/:id
 * @access  Private (Admin)
 */
export const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingProblem = await prisma.dSAProblem.findUnique({
    where: { id },
  });

  if (!existingProblem) {
    throw new CustomError('Problem not found', 404);
  }

  // Delete all related solutions first
  await prisma.dSASolution.deleteMany({
    where: { problemId: id },
  });

  // Delete the problem
  await prisma.dSAProblem.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Submit a solution for a DSA problem
 * @route   POST /api/dsa-practice/problems/:id/submit
 * @access  Private
 */
export const submitSolution = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, language } = req.body;
  const userId = (req as any).user.id;

  if (!code || !language) {
    throw new CustomError('Code and language are required', 400);
  }

  const problem = await prisma.dSAProblem.findUnique({
    where: { id },
  });

  if (!problem) {
    throw new CustomError('Problem not found', 404);
  }

  // Here we would normally execute the code against test cases
  // For now, we'll simulate the execution with a mock result

  // Extract test cases from the problem
  const testCases = problem.hiddenTestCases as any[];
  
  // Mock execution results
  const executionResults = testCases.map((testCase, index) => {
    // In a real implementation, we would execute the code against each test case
    // and return the actual result
    
    // For now, we'll randomly determine if the test passes (80% chance of success)
    const passed = Math.random() > 0.2;
    
    return {
      testCaseId: index,
      passed,
      expectedOutput: testCase.expected,
      actualOutput: passed ? testCase.expected : 'Mock incorrect output',
      executionTime: Math.floor(Math.random() * 100) + 10, // Random time between 10-110ms
    };
  });

  // Determine overall status
  const allPassed = executionResults.every(result => result.passed);
  const status = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

  // Calculate average execution time
  const totalExecutionTime = executionResults.reduce((sum, result) => sum + result.executionTime, 0);
  const avgExecutionTime = Math.floor(totalExecutionTime / executionResults.length);

  // Save the solution
  const solution = await prisma.dSASolution.create({
    data: {
      code,
      language,
      status,
      runTime: avgExecutionTime,
      memory: Math.floor(Math.random() * 5000) + 1000, // Random memory between 1000-6000 KB
      testResults: executionResults,
      problemId: id,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      solution,
      executionResults: {
        status,
        passed: allPassed,
        testResults: executionResults,
        executionTime: `${avgExecutionTime}ms`,
        memoryUsed: `${solution.memory}KB`,
      },
    },
  });
});

/**
 * @desc    Get user solutions for a problem
 * @route   GET /api/dsa-practice/problems/:id/solutions
 * @access  Private
 */
export const getUserSolutions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const solutions = await prisma.dSASolution.findMany({
    where: {
      problemId: id,
      userId,
    },
    orderBy: {
      submittedAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: solutions,
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/dsa-practice/user/stats
 * @access  Private
 */
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  // Get all user solutions
  const solutions = await prisma.dSASolution.findMany({
    where: {
      userId,
    },
    include: {
      problem: {
        select: {
          difficulty: true,
        },
      },
    },
  });

  // Get all solved problem IDs (accepted solutions only)
  const solvedProblemIds = new Set();
  solutions.forEach(solution => {
    if (solution.status === 'ACCEPTED') {
      solvedProblemIds.add(solution.problemId);
    }
  });

  // Calculate statistics
  const totalSubmissions = solutions.length;
  const totalSolved = solvedProblemIds.size;
  
  // Count by difficulty
  const easyCount = await prisma.dSASolution.count({
    where: {
      userId,
      status: 'ACCEPTED',
      problem: {
        difficulty: 'EASY',
      },
    },
    distinct: ['problemId'],
  });

  const mediumCount = await prisma.dSASolution.count({
    where: {
      userId,
      status: 'ACCEPTED',
      problem: {
        difficulty: 'MEDIUM',
      },
    },
    distinct: ['problemId'],
  });

  const hardCount = await prisma.dSASolution.count({
    where: {
      userId,
      status: 'ACCEPTED',
      problem: {
        difficulty: 'HARD',
      },
    },
    distinct: ['problemId'],
  });

  // Get total available problems
  const totalProblems = await prisma.dSAProblem.count({
    where: {
      isPublished: true,
    },
  });

  // Calculate streak (mock implementation for now)
  // In a real app, we'd track submission dates to calculate streak
  const streak = Math.floor(Math.random() * 10) + 1;

  res.status(200).json({
    success: true,
    data: {
      totalProblems,
      totalSubmissions,
      totalSolved,
      solvedByDifficulty: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
      currentStreak: streak,
      progress: totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0,
    },
  });
});
