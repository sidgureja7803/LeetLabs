import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { asyncHandler } from '../../middlewares/error.middleware';
import { CustomError } from '../../middlewares/error.middleware';
import path from 'path';
import fs from 'fs';
import { ContentType, ContentVisibility } from '../../types/content.types';

interface AuthRequest extends Request {
  user: {
    id: string;
    email?: string;
    role?: string;
    isAdmin?: boolean;
    isTeacher?: boolean;
    isStudent?: boolean;
  };
}

type PrismaWhereInput = Record<string, unknown>;

const prisma = new PrismaClient();

// Content types are defined in the Prisma schema

/**
 * @desc    Get all contents with filtering and pagination
 * @route   GET /api/content-management/contents
 * @access  Private
 */
export const getContents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    type,
    subject,
    search,
    tags,
    visibility,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build filter conditions
  const where: PrismaWhereInput = {};

  if (visibility) {
    where.visibility = visibility as ContentVisibility;
  } else {
    // Apply visibility restrictions based on user role
    if (req.user) {
      // If admin or teacher, show all content
      if (req.user.isAdmin || req.user.isTeacher) {
        // No additional filters needed
      } else {
        // For students and other users, apply visibility restrictions
        where.OR = [
          { visibility: ContentVisibility.PUBLIC },
          {
            visibility: ContentVisibility.ENROLLED,
            subject: {
              enrollments: {
                some: {
                  userId: req.user.id,
                },
              },
            },
          },
        ];
      }
    } else {
      // For unauthenticated users, show only public content
      where.visibility = ContentVisibility.PUBLIC;
    }
  }

  if (type) {
    where.type = type;
  }

  if (subject) {
    where.subjectId = subject as string;
  }

  if (search) {
    where.OR = [
      ...(where.OR as any[] || []),
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Extract tags if provided
  if (tags) {
    const tagsList = typeof tags === 'string' ? [tags] : (tags as string[]);
    where.tags = {
      hasSome: tagsList,
    };
  }

  // Calculate pagination
  const skip = (+page - 1) * +limit;

  // Get total count for pagination
  const [totalContent, documentsCount] = await Promise.all([
    (prisma as any).content.count({ where }),
    (prisma as any).content.count({ where: { ...where, type: ContentType.DOCUMENT } }),
  ]);

  // Get contents with pagination and sorting
  const contents = await (prisma as any).content.findMany({
    where,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          views: true,
          downloads: true,
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      [sortBy as string]: sortOrder,
    },
    skip,
    take: +limit,
  });

  res.status(200).json({
    success: true,
    data: {
      contents,
      pagination: {
        page: +page,
        limit: +limit,
        totalItems: totalContent,
        totalPages: Math.ceil(totalContent / +limit),
      },
    },
  });
});

/**
 * @desc    Get a single content by ID
 * @route   GET /api/content-management/contents/:id
 * @access  Private
 */
export const getContentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const content = await (prisma as any).content.findUnique({
    where: { id },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!content) {
    throw new CustomError('Content not found', 404);
  }

  // Check visibility permissions
  const { user } = req;
  if (content && content.visibility !== ContentVisibility.PUBLIC) {
    if (
      content.visibility === ContentVisibility.PRIVATE &&
      !user.isAdmin &&
      !user.isTeacher &&
      content.userId !== user.id
    ) {
      throw new CustomError('You do not have permission to view this content', 403);
    }

    if (
      content.visibility === ContentVisibility.ENROLLED &&
      !user.isAdmin &&
      !user.isTeacher &&
      content.userId !== user.id
    ) {
      // Check if user is enrolled in the course
      const enrollment = await (prisma as any).enrollment.findFirst({
        where: {
          userId: user.id,
          subjectId: content.subjectId,
        },
      });

      if (!enrollment) {
        throw new CustomError('You must be enrolled to view this content', 403);
      }
    }
  }

  // Record a view (if not the content owner)
  if (content.userId !== user.id) {
    // Check if user has already viewed this content today
    const existingView = await (prisma as any).contentView.findFirst({
      where: {
        contentId: id,
        userId: user.id,
        viewedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        },
      },
    });

    if (!existingView) {
      await (prisma as any).contentView.create({
        data: {
          contentId: id,
          userId: user.id,
        },
      });
    }
  }

  // Find related content from the same subject
  const mostPopular = await (prisma as any).content.findMany({
    where: {
      subjectId: content.subjectId,
      id: { not: id }, // Exclude current content
      visibility: {
        in: [ContentVisibility.PUBLIC, ContentVisibility.ENROLLED],
      },
    },
    select: {
      id: true,
      title: true,
      type: true,
      format: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  res.status(200).json({
    success: true,
    data: {
      ...content,
      relatedContent: mostPopular,
    },
  });
});

/**
 * @desc    Create new content
 * @route   POST /api/content-management/contents
 * @access  Private (Teachers, Admins)
 */
export const createContent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    title,
    type,
    subjectId,
    description,
    visibility,
    tags,
    url,
    format,
    fileSize,
    duration,
  } = req.body;

  const { user } = req;

  // Validate required fields
  if (!title || !type || !subjectId) {
    throw new CustomError('Missing required fields', 400);
  }

  // Validate content type
  if (!Object.values(ContentType).includes(type as ContentType)) {
    throw new CustomError('Invalid content type', 400);
  }

  // Validate visibility
  if (visibility && !Object.values(ContentVisibility).includes(visibility as ContentVisibility)) {
    throw new CustomError('Invalid visibility option', 400);
  }

  // Get subjects list from database
  const subjects = await (prisma as any).subject.findMany({
    where: { id: subjectId },
  });

  if (!subjects) {
    throw new CustomError('Subject not found', 404);
  }

  // For LINK type, validate URL
  if (type === ContentType.LINK && !url) {
    throw new CustomError('URL is required for link content', 400);
  }

  // Create content
  const content = await (prisma as any).content.create({
    data: {
      title,
      type,
      subjectId,
      description,
      visibility: visibility || ContentVisibility.ENROLLED,
      tags: tags ? Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim()) : [],
      url,
      format,
      fileSize,
      duration,
      userId: user.id,
      filePath: req.file ? req.file.path : null,
    },
  });

  res.status(201).json({
    success: true,
    data: content,
  });
});

/**
 * @desc    Update content
 * @route   PUT /api/content-management/contents/:id
 * @access  Private (Owner, Teachers, Admins)
 */
export const updateContent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const { user } = req;

  // Find the content
  const content = await (prisma as any).content.findUnique({
    where: { id },
  });

  if (!content) {
    throw new CustomError('Content not found', 404);
  }

  // Check permissions - only content owner, teachers, or admins can update
  if (content.userId !== user.id && !user.isAdmin && !user.isTeacher) {
    throw new CustomError('You do not have permission to update this content', 403);
  }

  // Update content
  const updatedContent = await (prisma as any).content.update({
    where: { id },
    data: {
      ...updateData,
      // Handle tags properly if provided
      tags: updateData.tags ? 
        Array.isArray(updateData.tags) ? 
          updateData.tags : 
          updateData.tags.split(',').map((tag: string) => tag.trim()) 
        : undefined,
    },
  });

  res.status(200).json({
    success: true,
    data: updatedContent,
  });
});

/**
 * @desc    Delete content
 * @route   DELETE /api/content-management/contents/:id
 * @access  Private (Owner, Teachers, Admins)
 */
export const deleteContent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { user } = req;

  // Find the content
  const content = await (prisma as any).content.findUnique({
    where: { id },
  });

  if (!content) {
    throw new CustomError('Content not found', 404);
  }

  // Check permissions - only content owner, teachers, or admins can delete
  if (content.userId !== user.id && !user.isAdmin && !user.isTeacher) {
    throw new CustomError('You do not have permission to delete this content', 403);
  }

  // Delete file from storage if it exists
  if (content.filePath) {
    try {
      fs.unlinkSync(content.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  // Delete all related records (cascade is handled by Prisma)
  await (prisma as any).content.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Like content
 * @route   POST /api/content-management/contents/:id/like
 * @access  Private
 */
export const likeContent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { user } = req;

  // Check if content exists
  const content = await (prisma as any).content.findUnique({
    where: { id },
  });

  if (!content) {
    throw new CustomError('Content not found', 404);
  }

  // Check if user already liked the content
  const existingLike = await (prisma as any).contentLike.findFirst({
    where: {
      contentId: id,
      userId: user.id,
    },
  });

  if (existingLike) {
    // Unlike content
    await (prisma as any).contentLike.delete({
      where: { id: existingLike.id },
    });

    res.status(200).json({
      success: true,
      data: { liked: false },
    });
  } else {
    // Like content
    await (prisma as any).contentLike.create({
      data: {
        contentId: id,
        userId: user.id,
      },
    });

    res.status(200).json({
      success: true,
      data: { liked: true },
    });
  }
});

/**
 * @desc    Add comment to content
 * @route   POST /api/content-management/contents/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  const { user } = req;

  if (!text) {
    throw new CustomError('Comment text is required', 400);
  }

  // Check if content exists
  const content = await (prisma as any).content.findUnique({
    where: { id },
  });

  if (!content) {
    throw new CustomError('Content not found', 404);
  }

  const comment = await (prisma as any).contentComment.create({
    data: {
      text,
      contentId: id,
      userId: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: comment,
  });
});

/**
 * @desc    Get all subjects (for content management)
 * @route   GET /api/content-management/subjects
 * @access  Private
 */
export const getSubjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subjects = await (prisma as any).subject.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    data: subjects,
  });
});

/**
 * @desc    Record content download
 * @route   POST /api/content-management/contents/:id/download
 * @access  Private
 */
export const recordDownload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { user } = req;

  // Check if content exists
  const content = await (prisma as any).content.findUnique({
    where: { id },
  });

  if (!content) {
    throw new CustomError('Content not found', 404);
  }

  // Record the download
  await (prisma as any).contentDownload.create({
    data: {
      contentId: id,
      userId: user.id,
    },
  });

  // Get the file path
  const filePath = content.filePath;

  if (!filePath || !fs.existsSync(filePath)) {
    throw new CustomError('File not found', 404);
  }

  // The actual file download would be handled at the route level
  // Here we're just recording the download event

  res.status(200).json({
    success: true,
    data: {
      downloadUrl: `/api/content-management/download/${id}`,
      filename: path.basename(filePath),
    },
  });
});

/**
 * @desc    Get content statistics
 * @route   GET /api/content-management/stats
 * @access  Private (Admin, Teachers)
 */
export const getContentStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: userId } = req.user;

  // Different stats based on user role
  const where: PrismaWhereInput = {};
  
  // If not admin or teacher, filter by user ID
  if (!req.user.isAdmin && !req.user.isTeacher) {
    where.userId = userId;
  }

  // Skip visibility check for admin/teacher
  const userRole = req.user as { isAdmin?: boolean; isTeacher?: boolean };
  if (!userRole.isAdmin && !userRole.isTeacher) {
    where.userId = userId;
  }

  // Basic counts
  const [
    totalContent,
    documentsCount,
    videosCount,
    linksCount,
    modulesCount,
    viewsCount,
    downloadsCount,
    commentsCount,
    likesCount,
  ] = await (prisma as any).$transaction([
    (prisma as any).content.count({ where }),
    (prisma as any).content.count({ where: { ...where, type: ContentType.DOCUMENT } }),
    (prisma as any).content.count({ where: { ...where, type: ContentType.VIDEO } }),
    (prisma as any).content.count({ where: { ...where, type: ContentType.LINK } }),
    (prisma as any).content.count({ where: { ...where, type: ContentType.MODULE } }),
    (prisma as any).contentView.count({ 
      where: { content: where }
    }),
    (prisma as any).contentDownload.count({ 
      where: { content: where }
    }),
    (prisma as any).contentComment.count({ 
      where: { content: where }
    }),
    (prisma as any).contentLike.count({ 
      where: { content: where }
    }),
  ]);

  // Get content added over time (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const contentOverTime = await (prisma as any).content.groupBy({
    by: ['createdAt'],
    where: {
      ...where,
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    _count: true,
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Get most viewed content
  const mostViewedContent = await (prisma as any).content.findMany({
    where,
    select: {
      id: true,
      title: true,
      type: true,
      createdAt: true,
      _count: {
        select: {
          views: true,
        },
      },
    },
    orderBy: {
      views: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  res.status(200).json({
    success: true,
    data: {
      counts: {
        total: totalContent,
        documents: documentsCount,
        videos: videosCount,
        links: linksCount,
        modules: modulesCount,
        views: viewsCount,
        downloads: downloadsCount,
        comments: commentsCount,
        likes: likesCount,
      },
      contentOverTime,
      mostViewed: mostViewedContent,
    },
  });
});
