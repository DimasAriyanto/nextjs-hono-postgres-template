import { NotFoundError, ConflictError, InternalError } from '@/server/errors';
import { articleCategoryRepository } from '@/server/repositories';
import { slugify } from '@/libs/string';
import type { TInsertArticleCategory } from '@/server/databases/schemas/article-categories.schema';

export class ArticleCategoryService {
	/**
	 * Get all categories, optionally filtered by name search
	 */
	async getAllCategories(options?: { search?: string }) {
		return articleCategoryRepository.findAll(options);
	}

	/**
	 * Get category by ID
	 */
	async getCategoryById(id: string) {
		const category = await articleCategoryRepository.findById(id);

		if (!category) {
			throw new NotFoundError('Category');
		}

		return category;
	}

	/**
	 * Create new category — auto-slugifies from name (or the given slug) and guarantees uniqueness
	 */
	async createCategory(data: { name: string; slug?: string; created_by?: string }) {
		const existingName = await articleCategoryRepository.findByName(data.name);
		if (existingName) {
			throw new ConflictError('Category name already exists');
		}

		const slug = await this.resolveUniqueSlug(data.slug || data.name);

		const categoryData: TInsertArticleCategory = {
			name: data.name,
			slug,
			created_by: data.created_by,
		};

		return articleCategoryRepository.create(categoryData);
	}

	/**
	 * Update category
	 */
	async updateCategory(id: string, data: { name?: string; slug?: string; updated_by?: string }) {
		const existingCategory = await articleCategoryRepository.findById(id);
		if (!existingCategory) {
			throw new NotFoundError('Category');
		}

		if (data.name && data.name !== existingCategory.name) {
			const nameExists = await articleCategoryRepository.findByName(data.name);
			if (nameExists) {
				throw new ConflictError('Category name already exists');
			}
		}

		const updateData: Partial<TInsertArticleCategory> = {
			name: data.name,
			updated_by: data.updated_by,
		};

		if (data.slug || (data.name && data.name !== existingCategory.name)) {
			updateData.slug = await this.resolveUniqueSlug(data.slug || data.name!, id);
		}

		const category = await articleCategoryRepository.update(id, updateData);

		if (!category) {
			throw new InternalError('Failed to update category');
		}

		return category;
	}

	/**
	 * Delete category — articles referencing it fall back to uncategorized (`ON DELETE SET NULL`)
	 */
	async deleteCategory(id: string) {
		const existingCategory = await articleCategoryRepository.findById(id);
		if (!existingCategory) {
			throw new NotFoundError('Category');
		}

		const deleted = await articleCategoryRepository.delete(id);

		if (!deleted) {
			throw new InternalError('Failed to delete category');
		}

		return { message: 'Category deleted successfully' };
	}

	/**
	 * Turn a name/slug candidate into a unique, url-safe slug
	 */
	private async resolveUniqueSlug(source: string, excludeId?: string): Promise<string> {
		const base = slugify(source);
		let candidate = base;
		let suffix = 1;

		while (true) {
			const existing = await articleCategoryRepository.findBySlug(candidate);
			if (!existing || existing.id === excludeId) {
				return candidate;
			}
			suffix += 1;
			candidate = `${base}-${suffix}`;
		}
	}
}

export const articleCategoryService = new ArticleCategoryService();
