import { z } from 'zod';

// ============================================
// REQUEST SCHEMAS
// ============================================

/**
 * Add-to-gallery request schema — the file itself is uploaded first via the
 * generic /uploads/image endpoint; this just records the resulting file in
 * the gallery library.
 */
export const createGallerySchema = z.object({
	url: z.string().min(1, 'URL is required'),
	path: z.string().min(1, 'Path is required'),
	filename: z.string().min(1, 'Filename is required'),
	size: z.number().int().nonnegative(),
	mime_type: z.string().min(1, 'MIME type is required'),
	alt_text: z.string().optional(),
});

export type TCreateGalleryRequest = z.infer<typeof createGallerySchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

/**
 * Gallery image response
 */
export const gallerySchema = z.object({
	id: z.string(),
	url: z.string(),
	path: z.string(),
	filename: z.string(),
	size: z.number(),
	mime_type: z.string(),
	alt_text: z.string().nullable().optional(),
	created_at: z.string(),
	created_by: z.string().nullable().optional(),
});

export type TGallery = z.infer<typeof gallerySchema>;
