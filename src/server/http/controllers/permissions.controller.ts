import { Context } from 'hono';
import { permissionService } from '@/server/services';
import { response } from '@/server/http/response';

export const permissionsController = {
	/**
	 * GET /permissions
	 * Get all permissions
	 */
	async index(c: Context) {
		const permissions = await permissionService.getAllPermissions();

		return response.ok(c, permissions);
	},
};
