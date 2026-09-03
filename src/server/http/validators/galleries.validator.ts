import { createGallerySchema } from '@/contracts';
import { validateJson } from './helper';

/**
 * Add-to-gallery request validator
 */
export const createGalleryRequest = validateJson(createGallerySchema);
