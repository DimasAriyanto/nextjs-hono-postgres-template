import { and, eq, ilike } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { FaqsTable, type TSelectFaq, type TInsertFaq } from '@/server/databases/schemas/faqs.schema';
import type { TContentLocale } from '@/contracts/setting';

function buildFilter(locale?: TContentLocale, search?: string) {
	const conditions = [];
	if (locale) conditions.push(eq(FaqsTable.locale, locale));
	if (search) conditions.push(ilike(FaqsTable.question, `%${search}%`));

	if (conditions.length === 0) return undefined;
	return conditions.length === 1 ? conditions[0] : and(...conditions);
}

export class FaqRepository {
	/**
	 * Find all faqs with pagination, search and locale filter, ordered by sort_order ascending
	 */
	async findAll(options?: { page?: number; limit?: number; search?: string; locale?: TContentLocale }) {
		const { page = 1, limit = 10, search, locale } = options || {};

		return db.query.FaqsTable.findMany({
			where: buildFilter(locale, search),
			orderBy: (faqs, { asc }) => [asc(faqs.sort_order), asc(faqs.created_at)],
			limit,
			offset: (page - 1) * limit,
		});
	}

	/**
	 * Find every faq for a locale, ordered by sort_order — for public consumers (FAQ section,
	 * FAQPage JSON-LD) that need the whole list, not a page of it.
	 */
	async findAllByLocale(locale: TContentLocale) {
		return db.query.FaqsTable.findMany({
			where: eq(FaqsTable.locale, locale),
			orderBy: (faqs, { asc }) => [asc(faqs.sort_order), asc(faqs.created_at)],
		});
	}

	/**
	 * Find faq by ID
	 */
	async findById(id: string): Promise<TSelectFaq | undefined> {
		const [faq] = await db.select().from(FaqsTable).where(eq(FaqsTable.id, id)).limit(1);

		return faq;
	}

	/**
	 * Highest sort_order currently used for a locale — used to append new items to the end.
	 */
	async findMaxSortOrder(locale: TContentLocale): Promise<number> {
		const rows = await db.select({ sort_order: FaqsTable.sort_order }).from(FaqsTable).where(eq(FaqsTable.locale, locale));

		return rows.reduce((max, row) => Math.max(max, row.sort_order), -1);
	}

	/**
	 * Create new faq
	 */
	async create(data: TInsertFaq): Promise<TSelectFaq> {
		const [faq] = await db.insert(FaqsTable).values(data).returning();

		return faq;
	}

	/**
	 * Update faq by ID
	 */
	async update(id: string, data: Partial<TInsertFaq>): Promise<TSelectFaq | undefined> {
		const [faq] = await db
			.update(FaqsTable)
			.set({ ...data, updated_at: new Date().toISOString() })
			.where(eq(FaqsTable.id, id))
			.returning();

		return faq;
	}

	/**
	 * Delete faq by ID
	 */
	async delete(id: string): Promise<boolean> {
		const result = await db.delete(FaqsTable).where(eq(FaqsTable.id, id)).returning({ id: FaqsTable.id });

		return result.length > 0;
	}

	/**
	 * Count total faqs matching search and locale filter
	 */
	async count(search?: string, locale?: TContentLocale): Promise<number> {
		let query = db.select().from(FaqsTable).$dynamic();

		const filter = buildFilter(locale, search);
		if (filter) {
			query = query.where(filter);
		}

		const result = await query;
		return result.length;
	}
}

export const faqRepository = new FaqRepository();
