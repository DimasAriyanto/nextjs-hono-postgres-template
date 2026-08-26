import { z } from 'zod';

// ============================================
// REQUEST SCHEMAS
// ============================================

/**
 * Create article category request schema
 */
export const createArticleCategorySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required').optional(),
});

export type TCreateArticleCategoryRequest = z.infer<typeof createArticleCategorySchema>;

/**
 * Update article category request schema
 */
export const updateArticleCategorySchema = z.object({
	name: z.string().min(1, 'Name is required').optional(),
	slug: z.string().min(1, 'Slug is required').optional(),
});

export type TUpdateArticleCategoryRequest = z.infer<typeof updateArticleCategorySchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

/**
 * Article category response
 */
export const articleCategorySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	created_by: z.string().nullable().optional(),
	updated_by: z.string().nullable().optional(),
});

export type TArticleCategory = z.infer<typeof articleCategorySchema>;
