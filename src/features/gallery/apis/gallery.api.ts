import { client, handleResponse, ApiError } from '@/libs/api';
import type { TCreateGalleryRequest, TGallery } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// GALLERY API FUNCTIONS
// ============================================

/**
 * GET /api/v1/galleries
 * Get all gallery images with pagination
 */
export async function getGalleries(params?: { page?: number; limit?: number; search?: string }): Promise<ApiSuccessResponse<TGallery[]>> {
	return handleResponse<TGallery[]>(
		client.api.v1.galleries.$get({ query: params as Record<string, string> })
	);
}

/**
 * GET /api/v1/galleries/public
 * Get gallery images with pagination — public, no auth required
 */
export async function getPublicGalleries(params?: { page?: number; limit?: number; search?: string }): Promise<ApiSuccessResponse<TGallery[]>> {
	return handleResponse<TGallery[]>(
		client.api.v1.galleries.public.$get({ query: params as Record<string, string> })
	);
}

/**
 * POST /api/v1/galleries
 * Add an already-uploaded file to the gallery
 */
export async function createGallery(data: TCreateGalleryRequest): Promise<ApiSuccessResponse<TGallery>> {
	return handleResponse<TGallery>(
		client.api.v1.galleries.$post({ json: data })
	);
}

/**
 * DELETE /api/v1/galleries/:id
 * Delete gallery image
 */
export async function deleteGallery(id: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.galleries[':id'].$delete({ param: { id } })
	);
}

// Re-export ApiError for error handling
export { ApiError };
