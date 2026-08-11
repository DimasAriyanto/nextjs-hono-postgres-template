import { and, eq, ilike } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { ArticlesTable, type TSelectArticle, type TInsertArticle } from '@/server/databases/schemas/articles.schema';
import type { TArticleStatus } from '@/contracts/article';

function buildFilter(search?: string, status?: TArticleStatus) {
	const conditions = [];
	if (search) conditions.push(ilike(ArticlesTable.title, `%${search}%`));
	if (status) conditions.push(eq(ArticlesTable.status, status));

	if (conditions.length === 0) return undefined;
	return conditions.length === 1 ? conditions[0] : and(...conditions);
}

export class ArticleRepository {
	/**
	 * Find all articles with pagination, search and status filter
	 */
	async findAll(options?: { page?: number; limit?: number; search?: string; status?: TArticleStatus }) {
		const { page = 1, limit = 10, search, status } = options || {};

		const results = await db.query.ArticlesTable.findMany({
			where: buildFilter(search, status),
			with: {
				author: true,
			},
			orderBy: (articles, { desc }) => [desc(articles.created_at)],
			limit,
			offset: (page - 1) * limit,
		});

		return results;
	}

	/**
	 * Find article by ID
	 */
	async findById(id: string): Promise<TSelectArticle | undefined> {
		const [article] = await db.select().from(ArticlesTable).where(eq(ArticlesTable.id, id)).limit(1);

		return article;
	}

	/**
	 * Find article by slug
	 */
	async findBySlug(slug: string): Promise<TSelectArticle | undefined> {
		const [article] = await db.select().from(ArticlesTable).where(eq(ArticlesTable.slug, slug)).limit(1);

		return article;
	}

	/**
	 * Create new article
	 */
	async create(data: TInsertArticle): Promise<TSelectArticle> {
		const [article] = await db.insert(ArticlesTable).values(data).returning();

		return article;
	}

	/**
	 * Update article by ID
	 */
	async update(id: string, data: Partial<TInsertArticle>): Promise<TSelectArticle | undefined> {
		const [article] = await db
			.update(ArticlesTable)
			.set({ ...data, updated_at: new Date().toISOString() })
			.where(eq(ArticlesTable.id, id))
			.returning();

		return article;
	}

	/**
	 * Delete article by ID
	 */
	async delete(id: string): Promise<boolean> {
		const result = await db.delete(ArticlesTable).where(eq(ArticlesTable.id, id)).returning({ id: ArticlesTable.id });

		return result.length > 0;
	}

	/**
	 * Count total articles matching search and status filter
	 */
	async count(search?: string, status?: TArticleStatus): Promise<number> {
		let query = db.select().from(ArticlesTable).$dynamic();

		const filter = buildFilter(search, status);
		if (filter) {
			query = query.where(filter);
		}

		const result = await query;
		return result.length;
	}
}

export const articleRepository = new ArticleRepository();
