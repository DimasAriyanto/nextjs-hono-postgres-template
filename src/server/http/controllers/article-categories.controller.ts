import { Context } from 'hono';
import { articleCategoryService } from '@/server/services';
import { response } from '@/server/http/response';

export const articleCategoriesController = {
	/**
	 * GET /article-categories
	 * Get all categories, optionally filtered by name search
	 */
	async index(c: Context) {
		const search = c.req.query('search');
		const categories = await articleCategoryService.getAllCategories({ search });

		return response.ok(c, categories);
	},

	/**
	 * GET /article-categories/:id
	 * Get category by ID
	 */
	async show(c: Context) {
		const id = c.req.param('id') as string;
		const category = await articleCategoryService.getCategoryById(id);

		return response.ok(c, category);
	},

	/**
	 * POST /article-categories
	 * Create new category
	 */
	async create(c: Context) {
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const category = await articleCategoryService.createCategory({
			...body,
			created_by: payload.auid,
		});

		return response.created(c, category, 'Category created successfully');
	},

	/**
	 * PUT /article-categories/:id
	 * Update category
	 */
	async update(c: Context) {
		const id = c.req.param('id') as string;
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const category = await articleCategoryService.updateCategory(id, {
			...body,
			updated_by: payload.auid,
		});

		return response.ok(c, category, 'Category updated successfully');
	},

	/**
	 * DELETE /article-categories/:id
	 * Delete category
	 */
	async delete(c: Context) {
		const id = c.req.param('id') as string;
		await articleCategoryService.deleteCategory(id);

		return response.success(c, 'Category deleted successfully');
	},
};
