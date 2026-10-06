import { z } from 'zod';
import { CONTENT_LOCALES } from '@/i18n/config';

// ============================================
// REQUEST SCHEMAS
// ============================================

export const faqLocaleSchema = z.enum(CONTENT_LOCALES);

/**
 * Create faq request schema
 */
export const createFaqSchema = z.object({
	question: z.string().min(1, 'Question is required'),
	answer: z.string().min(1, 'Answer is required'),
	locale: faqLocaleSchema,
	sort_order: z.number().int().optional(),
});

export type TCreateFaqRequest = z.infer<typeof createFaqSchema>;

/**
 * Update faq request schema
 */
export const updateFaqSchema = z.object({
	question: z.string().min(1, 'Question is required').optional(),
	answer: z.string().min(1, 'Answer is required').optional(),
	locale: faqLocaleSchema.optional(),
	sort_order: z.number().int().optional(),
});

export type TUpdateFaqRequest = z.infer<typeof updateFaqSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const faqSchema = z.object({
	id: z.string(),
	question: z.string(),
	answer: z.string(),
	locale: z.string(),
	sort_order: z.number(),
	created_at: z.string(),
	updated_at: z.string(),
	created_by: z.string().nullable().optional(),
	updated_by: z.string().nullable().optional(),
});

export type TFaq = z.infer<typeof faqSchema>;
