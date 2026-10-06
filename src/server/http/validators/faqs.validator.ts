import { createFaqSchema, updateFaqSchema } from '@/contracts';
import { validateJson } from './helper';

/**
 * Create faq request validator
 */
export const createFaqRequest = validateJson(createFaqSchema);

/**
 * Update faq request validator
 */
export const updateFaqRequest = validateJson(updateFaqSchema);
