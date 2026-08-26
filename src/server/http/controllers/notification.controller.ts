import { Context } from 'hono';
import { notificationService } from '@/server/services';
import { AuthError } from '@/server/errors';
import { response, getPaginationParams } from '@/server/http/response';

export const notificationController = {
	/**
	 * GET /notifications
	 * Get paginated notifications for the current user
	 */
	async index(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const { page, limit } = getPaginationParams(c);
		const is_read = c.req.query('is_read');

		const result = await notificationService.getUserNotifications(payload.auid, {
			page,
			limit,
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

		const id = c.req.param('id') as string;
		const notification = await notificationService.getNotificationById(id, payload.auid);

		return response.ok(c, notification);
	},

	/**
	 * POST /notifications
	 * Create a notification for another user — admin only, since it lets the caller
	 * target an arbitrary recipient_id.
	 */
	async create(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();
		if (c.get('role') !== 'admin') throw AuthError.forbidden();

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

		const id = c.req.param('id') as string;
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

		const id = c.req.param('id') as string;
		const result = await notificationService.deleteNotification(id, payload.auid);

		return response.success(c, result.message);
	},
};
