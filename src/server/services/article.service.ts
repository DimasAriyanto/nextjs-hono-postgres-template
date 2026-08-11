import { NotFoundError, InternalError } from '@/server/errors';
import { articleRepository } from '@/server/repositories';
import { slugify } from '@/libs/string';
import type { TInsertArticle } from '@/server/databases/schemas/articles.schema';
import type { TArticleStatus } from '@/contracts/article';

export class ArticleService {
	/**
	 * Get all articles with pagination
	 */
	async getAllArticles(options?: { page?: number; limit?: number; search?: string; status?: TArticleStatus }) {
		const { page = 1, limit = 10, search, status } = options || {};

		const articles = await articleRepository.findAll({ page, limit, search, status });
		const total = await articleRepository.count(search, status);

		return {
			data: articles,
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get article by ID
	 */
	async getArticleById(id: string) {
		const article = await articleRepository.findById(id);

		if (!article) {
			throw new NotFoundError('Article');
		}

		return article;
	}

	/**
	 * Create new article
	 */
	async createArticle(data: {
		title: string;
		slug?: string;
		excerpt?: string;
		content: string;
		thumbnail_url?: string;
		status?: TArticleStatus;
		created_by?: string;
	}) {
		const slug = await this.resolveUniqueSlug(data.slug || data.title);
		const status = data.status ?? 'draft';

		const articleData: TInsertArticle = {
			title: data.title,
			slug,
			excerpt: data.excerpt,
			content: data.content,
			thumbnail_url: data.thumbnail_url,
			status,
			published_at: status === 'published' ? new Date().toISOString() : null,
			author_id: data.created_by,
			created_by: data.created_by,
		};

		return articleRepository.create(articleData);
	}

	/**
	 * Update article
	 */
	async updateArticle(
		id: string,
		data: {
			title?: string;
			slug?: string;
			excerpt?: string;
			content?: string;
			thumbnail_url?: string;
			status?: TArticleStatus;
			updated_by?: string;
		}
	) {
		const existingArticle = await articleRepository.findById(id);
		if (!existingArticle) {
			throw new NotFoundError('Article');
		}

		const updateData: Partial<TInsertArticle> = {
			title: data.title,
			excerpt: data.excerpt,
			content: data.content,
			thumbnail_url: data.thumbnail_url,
			status: data.status,
			updated_by: data.updated_by,
		};

		// Resolve slug if title or slug changed
		if (data.slug || (data.title && data.title !== existingArticle.title)) {
			updateData.slug = await this.resolveUniqueSlug(data.slug || data.title!, id);
		}

		// Stamp published_at the first time an article is published
		if (data.status === 'published' && existingArticle.status !== 'published') {
			updateData.published_at = new Date().toISOString();
		}

		const article = await articleRepository.update(id, updateData);

		if (!article) {
			throw new InternalError('Failed to update article');
		}

		return article;
	}

	/**
	 * Delete article
	 */
	async deleteArticle(id: string) {
		const existingArticle = await articleRepository.findById(id);
		if (!existingArticle) {
			throw new NotFoundError('Article');
		}

		const deleted = await articleRepository.delete(id);

		if (!deleted) {
			throw new InternalError('Failed to delete article');
		}

		return { message: 'Article deleted successfully' };
	}

	/**
	 * Turn a title/slug candidate into a unique, url-safe slug
	 */
	private async resolveUniqueSlug(source: string, excludeId?: string): Promise<string> {
		const base = slugify(source);
		let candidate = base;
		let suffix = 1;

		while (true) {
			const existing = await articleRepository.findBySlug(candidate);
			if (!existing || existing.id === excludeId) {
				return candidate;
			}
			suffix += 1;
			candidate = `${base}-${suffix}`;
		}
	}
}

export const articleService = new ArticleService();
