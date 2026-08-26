import { z } from 'zod';
import { articleCategorySchema } from './article-category';

// ============================================
// REQUEST SCHEMAS
// ============================================

export const articleStatusSchema = z.enum(['draft', 'published']);

export type TArticleStatus = z.infer<typeof articleStatusSchema>;

/**
 * Create article request schema
 */
export const createArticleSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	slug: z.string().min(1, 'Slug is required').optional(),
	excerpt: z.string().optional(),
	content: z.string().min(1, 'Content is required'),
	thumbnail_url: z.string().optional(),
	status: articleStatusSchema.optional(),
	category_id: z.string().uuid('Invalid category').nullable().optional(),
	tags: z.array(z.string().min(1)).optional(),
});

export type TCreateArticleRequest = z.infer<typeof createArticleSchema>;

/**
 * Update article request schema
 */
export const updateArticleSchema = z.object({
	title: z.string().min(1, 'Title is required').optional(),
	slug: z.string().min(1, 'Slug is required').optional(),
	excerpt: z.string().optional(),
	content: z.string().min(1, 'Content is required').optional(),
	thumbnail_url: z.string().optional(),
	status: articleStatusSchema.optional(),
	category_id: z.string().uuid('Invalid category').nullable().optional(),
	tags: z.array(z.string().min(1)).optional(),
});

export type TUpdateArticleRequest = z.infer<typeof updateArticleSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

/**
 * Article response
 */
export const articleSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	excerpt: z.string().nullable().optional(),
	content: z.string(),
	thumbnail_url: z.string().nullable().optional(),
	status: articleStatusSchema,
	published_at: z.string().nullable().optional(),
	author_id: z.string().nullable().optional(),
	category_id: z.string().nullable().optional(),
	tags: z.array(z.string()),
	created_at: z.string(),
	updated_at: z.string(),
	created_by: z.string().nullable().optional(),
	updated_by: z.string().nullable().optional(),
});

export type TArticle = z.infer<typeof articleSchema>;

/**
 * Article with author response
 */
export const articleWithAuthorSchema = articleSchema.extend({
	author: z.unknown().nullable().optional(),
	category: articleCategorySchema.nullable().optional(),
});

export type TArticleWithAuthor = z.infer<typeof articleWithAuthorSchema>;
