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
 * GET /api/v1/articles/public
 * Get published articles with pagination — public, no auth required
 */
export async function getPublicArticles(params?: { page?: number; limit?: number; search?: string }): Promise<ApiSuccessResponse<TArticleWithAuthor[]>> {
	return handleResponse<TArticleWithAuthor[]>(
		client.api.v1.articles.public.$get({ query: params as Record<string, string> })
	);
}

/**
 * GET /api/v1/articles/public/:slug
 * Get a published article by slug — public, no auth required
 */
export async function getPublicArticleBySlug(slug: string): Promise<ApiSuccessResponse<TArticleWithAuthor>> {
	return handleResponse<TArticleWithAuthor>(
		client.api.v1.articles.public[':slug'].$get({ param: { slug } })
	);
}

/**
 * Get a published article by slug, resolving to null on 404 instead of throwing —
 * for public detail pages that need to call notFound() themselves.
 */
export async function getPublicArticleBySlugSafe(slug: string): Promise<TArticleWithAuthor | null> {
	try {
		const { data } = await getPublicArticleBySlug(slug);
		return data;
	} catch (err) {
		if (err instanceof ApiError && err.isNotFound()) return null;
		throw err;
	}
}

/**
 * Get a few published articles related to (i.e. excluding) the given article —
 * for the "related articles" section on public detail pages.
 */
export async function getRelatedArticles(excludeId: string, limit = 3): Promise<TArticleWithAuthor[]> {
	const { data } = await getPublicArticles({ page: 1, limit: limit + 1 });
	return data.filter((article) => article.id !== excludeId).slice(0, limit);
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
