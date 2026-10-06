import { client, handleResponse, ApiError } from '@/libs/api';
import type { TFaq, TCreateFaqRequest, TUpdateFaqRequest, TContentLocale } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// FAQ API FUNCTIONS
// ============================================

/**
 * GET /api/v1/faqs/public
 * Get all faqs for a locale — public, no auth required
 */
export async function getPublicFaqs(locale?: TContentLocale): Promise<ApiSuccessResponse<TFaq[]>> {
	return handleResponse<TFaq[]>(
		client.api.v1.faqs.public.$get({ query: locale ? { locale } : undefined })
	);
}

/**
 * GET /api/v1/faqs
 * Get all faqs with pagination
 */
export async function getFaqs(params?: { page?: number; limit?: number; search?: string; locale?: TContentLocale }): Promise<ApiSuccessResponse<TFaq[]>> {
	return handleResponse<TFaq[]>(
		client.api.v1.faqs.$get({ query: params as Record<string, string> })
	);
}

/**
 * GET /api/v1/faqs/:id
 * Get faq by ID
 */
export async function getFaqById(id: string): Promise<ApiSuccessResponse<TFaq>> {
	return handleResponse<TFaq>(
		client.api.v1.faqs[':id'].$get({ param: { id } })
	);
}

/**
 * POST /api/v1/faqs
 * Create new faq
 */
export async function createFaq(data: TCreateFaqRequest): Promise<ApiSuccessResponse<TFaq>> {
	return handleResponse<TFaq>(
		client.api.v1.faqs.$post({ json: data })
	);
}

/**
 * PUT /api/v1/faqs/:id
 * Update faq
 */
export async function updateFaq(id: string, data: TUpdateFaqRequest): Promise<ApiSuccessResponse<TFaq>> {
	return handleResponse<TFaq>(
		client.api.v1.faqs[':id'].$put({ param: { id }, json: data } as { param: { id: string }; json: TUpdateFaqRequest })
	);
}

/**
 * DELETE /api/v1/faqs/:id
 * Delete faq
 */
export async function deleteFaq(id: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.faqs[':id'].$delete({ param: { id } })
	);
}

// Re-export ApiError for error handling
export { ApiError };
