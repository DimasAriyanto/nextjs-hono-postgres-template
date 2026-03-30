import { Context } from 'hono';
import { notificationService } from '@/server/services';
import { AuthError } from '@/server/errors';
import { response } from '@/server/http/response';

export const notificationController = {
	/**
	 * GET /notifications
	 * Get paginated notifications for the current user
	 */
	async index(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const { page, limit, is_read } = c.req.query();

		const result = await notificationService.getUserNotifications(payload.auid, {
			page: page ? Number(page) : 1,
			limit: limit ? Number(limit) : 20,
			isRead: is_read !== undefined ? is_read === 'true' : undefined,
		});

		return response.ok(c, result);
	},

	/**
	 * GET /notifications/unread
	 * Get unread notifications + count for the current user
	 */
	async unread(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const result = await notificationService.getUnreadNotifications(payload.auid);

		return response.ok(c, result);
	},

	/**
	 * GET /notifications/:id
	 * Get a single notification
	 */
	async show(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const id = c.req.param('id');
		const notification = await notificationService.getNotificationById(id);

		return response.ok(c, notification);
	},

	/**
	 * POST /notifications
	 * Create a notification (admin use)
	 */
	async create(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const body = await c.req.json();
		const notification = await notificationService.createNotification({
			...body,
			created_by: payload.auid,
		});

		return response.created(c, notification, 'Notification created');
	},

	/**
	 * PUT /notifications/:id/read
	 * Mark a notification as read
	 */
	async markAsRead(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const id = c.req.param('id');
		const notification = await notificationService.markAsRead(id, payload.auid);

		return response.ok(c, notification, 'Notification marked as read');
	},

	/**
	 * PUT /notifications/read-all
	 * Mark all notifications as read
	 */
	async markAllAsRead(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const result = await notificationService.markAllAsRead(payload.auid);

		return response.success(c, result.message);
	},

	/**
	 * DELETE /notifications/:id
	 * Delete a notification
	 */
	async destroy(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const id = c.req.param('id');
		const result = await notificationService.deleteNotification(id, payload.auid);

		return response.success(c, result.message);
	},
};
