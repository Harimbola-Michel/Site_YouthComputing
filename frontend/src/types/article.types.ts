// src/types/article.types.ts

// ============================================================
// PAGINATION (définie ici pour éviter l'import cassé)
// ============================================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// UTILISATEUR (référence simplifiée pour éviter la circularité)
// ============================================================
export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// ============================================================
// ARTICLE
// ============================================================
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  author: UserRef; // plutôt que User complet pour éviter les imports circulaires
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  publishedAt?: string;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  comments?: ArticleComment[];
}

// ============================================================
// COMMENTAIRE
// ============================================================
export interface ArticleComment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  parentId?: string;
  replies?: ArticleComment[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface ArticleCreateDTO {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status?: string;
  isFeatured?: boolean;
}

// ============================================================
// FILTRES
// ============================================================
export interface ArticleFilters extends PaginationParams {
  category?: string;
  status?: string;
  tag?: string;
  authorId?: string;
  isFeatured?: boolean;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  scheduled: number;
  totalViews: number;
  averageViews: number;
  mostViewed?: Article;
  byCategory: Record<string, number>;
  byMonth: { month: string; count: number }[];
}