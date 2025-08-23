/**
 * Type definitions for Content Management
 */

export enum ContentType {
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  MODULE = 'MODULE',
}

export enum ContentVisibility {
  PUBLIC = 'PUBLIC',
  ENROLLED = 'ENROLLED',
  PRIVATE = 'PRIVATE',
}

export interface ContentCreateInput {
  title: string;
  type: ContentType;
  description?: string;
  filePath?: string;
  url?: string;
  format?: string;
  fileSize?: string;
  duration?: string;
  tags: string[];
  visibility: ContentVisibility;
  userId: string;
  subjectId: string;
}

export interface ContentUpdateInput {
  title?: string;
  description?: string;
  filePath?: string;
  url?: string;
  format?: string;
  fileSize?: string;
  duration?: string;
  tags?: string[];
  visibility?: ContentVisibility;
  subjectId?: string;
}

export interface ContentFilterParams {
  type?: ContentType;
  subject?: string;
  search?: string;
  tags?: string[] | string;
  visibility?: ContentVisibility;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentItemCreateInput {
  title: string;
  description?: string;
  order: number;
  filePath?: string;
  url?: string;
  format?: string;
  fileSize?: string;
  duration?: string;
  contentId: string;
}

export interface ContentCommentInput {
  text: string;
  parentId?: string;
}
