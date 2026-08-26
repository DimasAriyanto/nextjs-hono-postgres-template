import { client, handleResponse, ApiError } from '@/libs/api';
import type { TArticleCategory, TCreateArticleCategoryRequest, TUpdateArticleCategoryRequest } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// ARTICLE CATEGORY API FUNCTIONS
// ============================================

/**
 * GET /api/v1/article-categories
 * Get all categories, optionally filtered by name search
 */
export async function getArticleCategories(params?: { search?: string }): Promise<ApiSuccessResponse<TArticleCategory[]>> {
	return handleResponse<TArticleCategory[]>(
		client.api.v1['article-categories'].$get({ query: params as Record<string, string> })
	);
}

/**
 * POST /api/v1/article-categories
 * Create new category
 */
export async function createArticleCategory(data: TCreateArticleCategoryRequest): Promise<ApiSuccessResponse<TArticleCategory>> {
	return handleResponse<TArticleCategory>(
		client.api.v1['article-categories'].$post({ json: data })
	);
}

/**
 * PUT /api/v1/article-categories/:id
 * Update category
 */
export async function updateArticleCategory(id: string, data: TUpdateArticleCategoryRequest): Promise<ApiSuccessResponse<TArticleCategory>> {
	return handleResponse<TArticleCategory>(
		client.api.v1['article-categories'][':id'].$put({ param: { id }, json: data } as { param: { id: string }; json: TUpdateArticleCategoryRequest })
	);
}

/**
 * DELETE /api/v1/article-categories/:id
 * Delete category
 */
export async function deleteArticleCategory(id: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1['article-categories'][':id'].$delete({ param: { id } })
	);
}

// Re-export ApiError for error handling
export { ApiError };
