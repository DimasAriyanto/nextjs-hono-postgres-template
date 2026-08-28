import { Context } from 'hono';
import { currencyService } from '@/server/services';
import { response } from '@/server/http/response';

export const currencyController = {
	/**
	 * GET /currency/convert?from=USD&to=IDR&amount=100
	 * Convert an amount between two currencies using the latest cached rate.
	 */
	async convert(c: Context) {
		const from = c.req.query('from')!.toUpperCase();
		const to = c.req.query('to')!.toUpperCase();
		const amount = Number(c.req.query('amount'));

		const result = await currencyService.convert(amount, from, to);

		return response.ok(c, result);
	},
};
