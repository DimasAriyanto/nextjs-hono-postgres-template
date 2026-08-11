import { Context } from 'hono';
import { settingService } from '@/server/services';
import { response } from '@/server/http/response';

export const settingsController = {
	/**
	 * GET /settings
	 * Get application settings
	 */
	async show(c: Context) {
		const settings = await settingService.getSettings();

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
