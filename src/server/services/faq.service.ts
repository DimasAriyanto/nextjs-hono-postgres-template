import { NotFoundError, InternalError } from '@/server/errors';
import { faqRepository } from '@/server/repositories';
import type { TInsertFaq } from '@/server/databases/schemas/faqs.schema';
import type { TContentLocale } from '@/contracts/setting';

export class FaqService {
	/**
	 * Get all faqs with pagination
	 */
	async getAllFaqs(options?: { page?: number; limit?: number; search?: string; locale?: TContentLocale }) {
		const { page = 1, limit = 10, search, locale } = options || {};

		const faqs = await faqRepository.findAll({ page, limit, search, locale });
		const total = await faqRepository.count(search, locale);

		return {
			data: faqs,
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get every faq for a locale — for public consumers (FAQ section, FAQPage JSON-LD)
	 */
	async getPublicFaqs(locale: TContentLocale) {
		return faqRepository.findAllByLocale(locale);
	}

	/**
	 * Get faq by ID
	 */
	async getFaqById(id: string) {
		const faq = await faqRepository.findById(id);

		if (!faq) {
			throw new NotFoundError('Faq');
		}

		return faq;
	}

	/**
	 * Create new faq — appends to the end of its locale's list unless an explicit sort_order is given
	 */
	async createFaq(data: {
		question: string;
		answer: string;
		locale: TContentLocale;
		sort_order?: number;
		created_by?: string;
	}) {
		const sortOrder = data.sort_order ?? (await faqRepository.findMaxSortOrder(data.locale)) + 1;

		const faqData: TInsertFaq = {
			question: data.question,
			answer: data.answer,
			locale: data.locale,
			sort_order: sortOrder,
			created_by: data.created_by,
		};

		return faqRepository.create(faqData);
	}

	/**
	 * Update faq
	 */
	async updateFaq(
		id: string,
		data: {
			question?: string;
			answer?: string;
			locale?: TContentLocale;
			sort_order?: number;
			updated_by?: string;
		},
	) {
		const existingFaq = await faqRepository.findById(id);
		if (!existingFaq) {
			throw new NotFoundError('Faq');
		}

		const updateData: Partial<TInsertFaq> = {
			question: data.question,
			answer: data.answer,
			locale: data.locale,
			sort_order: data.sort_order,
			updated_by: data.updated_by,
		};

		const faq = await faqRepository.update(id, updateData);

		if (!faq) {
			throw new InternalError('Failed to update faq');
		}

		return faq;
	}

	/**
	 * Delete faq
	 */
	async deleteFaq(id: string) {
		const existingFaq = await faqRepository.findById(id);
		if (!existingFaq) {
			throw new NotFoundError('Faq');
		}

		const deleted = await faqRepository.delete(id);

		if (!deleted) {
			throw new InternalError('Failed to delete faq');
		}

		return { message: 'Faq deleted successfully' };
	}
}

export const faqService = new FaqService();
