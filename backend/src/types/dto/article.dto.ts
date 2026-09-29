import { ArticleStatus } from '../roles.enum';
import { PaginationParams } from '../index';

export interface ArticleDTO {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  category: string;
  tags: string[];
  status: ArticleStatus;
  publishedAt?: Date;
  views: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  comments?: ArticleCommentDTO[];
}

export interface ArticleCommentDTO {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: ArticleCommentDTO[];
}

export interface CreateArticleDTO {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status?: ArticleStatus;
  isFeatured?: boolean;
  publishedAt?: Date;
}

export interface UpdateArticleDTO {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  status?: ArticleStatus;
  isFeatured?: boolean;
  publishedAt?: Date;
}

export interface CreateArticleCommentDTO {
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string;
}

export interface UpdateArticleCommentDTO {
  content?: string;
  isApproved?: boolean;
}

export interface ArticleFilterParams extends PaginationParams {
  search?: string;
  category?: string;
  status?: ArticleStatus;
  tag?: string;
  authorId?: string;
  isFeatured?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ArticleListDTO {
  articles: ArticleDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleStatsDTO {
  total: number;
  published: number;
  draft: number;
  archived: number;
  scheduled: number;
  totalViews: number;
  averageViews: number;
  mostViewed: ArticleDTO;
  byCategory: {
    [key: string]: number;
  };
  byMonth: {
    month: string;
    count: number;
  }[];
}

export interface ArticleExportDTO {
  id: string;
  title: string;
  category: string;
  status: string;
  author: string;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
}

export interface ArticleCommentListDTO {
  comments: ArticleCommentDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}