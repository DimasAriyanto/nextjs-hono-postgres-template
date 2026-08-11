import { Context } from 'hono';
import { articleService } from '@/server/services';
import { response, getPaginationParams } from '@/server/http/response';
import type { TArticleStatus } from '@/contracts/article';

export const articlesController = {
	/**
	 * GET /articles
	 * Get all articles with pagination
	 */
	async index(c: Context) {
		const { page, limit, search } = getPaginationParams(c);
		const status = c.req.query('status') as TArticleStatus | undefined;

		const result = await articleService.getAllArticles({ page, limit, search, status });

		return response.paginated(c, result.data, {
			page: result.meta.page,
			limit: result.meta.limit,
			total: result.meta.total,
			totalPages: result.meta.pages,
		}, 'OK');
	},

	/**
	 * GET /articles/:id
	 * Get article by ID
	 */
	async show(c: Context) {
		const id = c.req.param('id') as string;
		const article = await articleService.getArticleById(id);

		return response.ok(c, article);
	},

	/**
	 * POST /articles
	 * Create new article
	 */
	async create(c: Context) {
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const article = await articleService.createArticle({
			...body,
			created_by: payload.auid,
		});

		return response.created(c, article, 'Article created successfully');
	},

	/**
	 * PUT /articles/:id
	 * Update article
	 */
	async update(c: Context) {
		const id = c.req.param('id') as string;
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const article = await articleService.updateArticle(id, {
			...body,
			updated_by: payload.auid,
		});

		return response.ok(c, article, 'Article updated successfully');
	},

	/**
	 * DELETE /articles/:id
	 * Delete article
	 */
	async delete(c: Context) {
		const id = c.req.param('id') as string;
		await articleService.deleteArticle(id);

		return response.success(c, 'Article deleted successfully');
	},
};
