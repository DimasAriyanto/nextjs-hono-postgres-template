import { z } from 'zod';

/**
 * Pagination request schema
 */
export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	search: z.string().optional(),
});

export type TPaginationRequest = z.infer<typeof paginationSchema>;

/**
 * Pagination response meta
 */
export const paginationMetaSchema = z.object({
	page: z.number(),
	limit: z.number(),
	total: z.number(),
	totalPages: z.number(),
});

export type TPaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * ID param schema
 */
export const idParamSchema = z.object({
	id: z.string().uuid('Invalid ID format'),
});

export type TIdParam = z.infer<typeof idParamSchema>;
