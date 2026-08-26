import { createArticleCategorySchema, updateArticleCategorySchema } from '@/contracts';
import { validateJson } from './helper';

/**
 * Create article category request validator
 */
export const createArticleCategoryRequest = validateJson(createArticleCategorySchema);

/**
 * Update article category request validator
 */
export const updateArticleCategoryRequest = validateJson(updateArticleCategorySchema);
