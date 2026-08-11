import { createArticleSchema, updateArticleSchema } from '@/contracts';
import { validateJson } from './helper';

/**
 * Create article request validator
 */
export const createArticleRequest = validateJson(createArticleSchema);

/**
 * Update article request validator
 */
export const updateArticleRequest = validateJson(updateArticleSchema);
