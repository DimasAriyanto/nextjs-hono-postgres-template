import { eq, ilike } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import {
	ArticleCategoriesTable,
	type TSelectArticleCategory,
	type TInsertArticleCategory,
} from '@/server/databases/schemas/article-categories.schema';

export class ArticleCategoryRepository {
	/**
	 * Find all categories, optionally filtered by name search
	 */
	async findAll(options?: { search?: string }): Promise<TSelectArticleCategory[]> {
		const { search } = options || {};

		let query = db.select().from(ArticleCategoriesTable).$dynamic();

		if (search) {
			query = query.where(ilike(ArticleCategoriesTable.name, `%${search}%`));
		}

		return query.orderBy(ArticleCategoriesTable.name);
	}

	/**
	 * Find category by ID
	 */
	async findById(id: string): Promise<TSelectArticleCategory | undefined> {
		const [category] = await db.select().from(ArticleCategoriesTable).where(eq(ArticleCategoriesTable.id, id)).limit(1);

		return category;
	}

	/**
	 * Find category by name
	 */
	async findByName(name: string): Promise<TSelectArticleCategory | undefined> {
		const [category] = await db.select().from(ArticleCategoriesTable).where(eq(ArticleCategoriesTable.name, name)).limit(1);

		return category;
	}

	/**
	 * Find category by slug
	 */
	async findBySlug(slug: string): Promise<TSelectArticleCategory | undefined> {
		const [category] = await db.select().from(ArticleCategoriesTable).where(eq(ArticleCategoriesTable.slug, slug)).limit(1);

		return category;
	}

	/**
	 * Create new category
	 */
	async create(data: TInsertArticleCategory): Promise<TSelectArticleCategory> {
		const [category] = await db.insert(ArticleCategoriesTable).values(data).returning();

		return category;
	}

	/**
	 * Update category by ID
	 */
	async update(id: string, data: Partial<TInsertArticleCategory>): Promise<TSelectArticleCategory | undefined> {
		const [category] = await db
			.update(ArticleCategoriesTable)
			.set({ ...data, updated_at: new Date().toISOString() })
			.where(eq(ArticleCategoriesTable.id, id))
			.returning();

		return category;
	}

	/**
	 * Delete category by ID
	 */
	async delete(id: string): Promise<boolean> {
		const result = await db.delete(ArticleCategoriesTable).where(eq(ArticleCategoriesTable.id, id)).returning({ id: ArticleCategoriesTable.id });

		return result.length > 0;
	}
}

export const articleCategoryRepository = new ArticleCategoryRepository();
