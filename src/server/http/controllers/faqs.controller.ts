import { Context } from 'hono';
import { faqService } from '@/server/services';
import { response, getPaginationParams } from '@/server/http/response';
import { isContentLocale, DEFAULT_CONTENT_LOCALE } from '@/contracts/setting';

export const faqsController = {
	/**
	 * GET /faqs/public
	 * Get all faqs for a locale — public, no auth required
	 */
	async publicIndex(c: Context) {
		const rawLocale = c.req.query('locale');
		const locale = isContentLocale(rawLocale) ? rawLocale : DEFAULT_CONTENT_LOCALE;

		const faqs = await faqService.getPublicFaqs(locale);

		return response.ok(c, faqs);
	},

	/**
	 * GET /faqs
	 * Get all faqs with pagination
	 */
	async index(c: Context) {
		const { page, limit, search } = getPaginationParams(c);
		const rawLocale = c.req.query('locale');
		const locale = isContentLocale(rawLocale) ? rawLocale : undefined;

		const result = await faqService.getAllFaqs({ page, limit, search, locale });

		return response.paginated(c, result.data, {
			page: result.meta.page,
			limit: result.meta.limit,
			total: result.meta.total,
			totalPages: result.meta.pages,
		}, 'OK');
	},

	/**
	 * GET /faqs/:id
	 * Get faq by ID
	 */
	async show(c: Context) {
		const id = c.req.param('id') as string;
		const faq = await faqService.getFaqById(id);

		return response.ok(c, faq);
	},

	/**
	 * POST /faqs
	 * Create new faq
	 */
	async create(c: Context) {
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const faq = await faqService.createFaq({
			...body,
			created_by: payload.auid,
		});

		return response.created(c, faq, 'Faq created successfully');
	},

	/**
	 * PUT /faqs/:id
	 * Update faq
	 */
	async update(c: Context) {
		const id = c.req.param('id') as string;
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const faq = await faqService.updateFaq(id, {
			...body,
			updated_by: payload.auid,
		});

		return response.ok(c, faq, 'Faq updated successfully');
	},

	/**
	 * DELETE /faqs/:id
	 * Delete faq
	 */
	async delete(c: Context) {
		const id = c.req.param('id') as string;
		await faqService.deleteFaq(id);

		return response.success(c, 'Faq deleted successfully');
	},
};
