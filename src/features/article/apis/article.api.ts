import { client, handleResponse, ApiError } from '@/libs/api';
import type {
	TArticle,
	TArticleStatus,
	TArticleWithAuthor,
	TCreateArticleRequest,
	TUpdateArticleRequest,
} from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// ARTICLE API FUNCTIONS
// ============================================

/**
 * GET /api/v1/articles
 * Get all articles with pagination
 */
export async function getArticles(params?: { page?: number; limit?: number; search?: string; status?: TArticleStatus }): Promise<ApiSuccessResponse<TArticleWithAuthor[]>> {
	return handleResponse<TArticleWithAuthor[]>(
		client.api.v1.articles.$get({ query: params as Record<string, string> })
	);
}

/**
 * GET /api/v1/articles/:id
 * Get article by ID
 */
export async function getArticleById(id: string): Promise<ApiSuccessResponse<TArticle>> {
	return handleResponse<TArticle>(
		client.api.v1.articles[':id'].$get({ param: { id } })
	);
}

/**
 * POST /api/v1/articles
 * Create new article
 */
export async function createArticle(data: TCreateArticleRequest): Promise<ApiSuccessResponse<TArticle>> {
	return handleResponse<TArticle>(
		client.api.v1.articles.$post({ json: data })
	);
}

/**
 * PUT /api/v1/articles/:id
 * Update article
 */
export async function updateArticle(id: string, data: TUpdateArticleRequest): Promise<ApiSuccessResponse<TArticle>> {
	return handleResponse<TArticle>(
		client.api.v1.articles[':id'].$put({ param: { id }, json: data } as { param: { id: string }; json: TUpdateArticleRequest })
	);
}

/**
 * DELETE /api/v1/articles/:id
 * Delete article
 */
export async function deleteArticle(id: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.articles[':id'].$delete({ param: { id } })
	);
}

// Re-export ApiError for error handling
export { ApiError };
