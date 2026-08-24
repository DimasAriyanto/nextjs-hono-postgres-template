import { Context } from 'hono';
import { settingService } from '@/server/services';
import { response } from '@/server/http/response';
import { isContentLocale } from '@/contracts/setting';

export const settingsController = {
	/**
	 * GET /settings?locale=id|en
	 * Get application settings, with translatable content resolved for the given content locale
	 */
	async show(c: Context) {
		const rawLocale = c.req.query('locale');
		const settings = await settingService.getSettings(isContentLocale(rawLocale) ? rawLocale : undefined);

		return response.ok(c, settings);
	},

	/**
	 * PUT /settings
	 * Update application settings
	 */
	async update(c: Context) {
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const settings = await settingService.updateSettings(body, payload.auid);

		return response.ok(c, settings, 'Settings updated successfully');
	},
};
