import { NotFoundError } from '@/server/errors';
import { notificationRepository } from '@/server/repositories';
import type { TInsertNotification } from '@/server/databases/schemas/notifications.schema';
import type { TNotificationType } from '@/contracts/notification';

export class NotificationService {
	/**
	 * Get paginated notifications for a user
	 */
	async getUserNotifications(
		recipientId: string,
		options?: { page?: number; limit?: number; isRead?: boolean }
	) {
		const { page = 1, limit = 20, isRead } = options || {};

		const notifications = await notificationRepository.findByRecipient(recipientId, { page, limit, isRead });
		const total = await notificationRepository.countByRecipient(recipientId, isRead);

		return {
			data: notifications,
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get unread notifications for a user
	 */
	async getUnreadNotifications(recipientId: string) {
		const notifications = await notificationRepository.findUnread(recipientId);
		const count = await notificationRepository.countByRecipient(recipientId, false);

		return { data: notifications, unread_count: count };
	}

	/**
	 * Get a single notification by ID
	 */
	async getNotificationById(id: string) {
		const notification = await notificationRepository.findById(id);

		if (!notification) {
			throw new NotFoundError('Notification');
		}

		return notification;
	}

	/**
	 * Create a notification for a user
	 */
	async createNotification(data: {
		recipient_id: string;
		type?: TNotificationType;
		title: string;
		message: string;
		created_by?: string;
	}) {
		const payload: TInsertNotification = {
			recipient_id: data.recipient_id,
			type: data.type ?? 'info',
			title: data.title,
			message: data.message,
			created_by: data.created_by,
		};

		return notificationRepository.create(payload);
	}

	/**
	 * Mark a notification as read
	 */
	async markAsRead(id: string, recipientId: string) {
		const notification = await notificationRepository.findById(id);

		if (!notification) {
			throw new NotFoundError('Notification');
		}

		if (notification.recipient_id !== recipientId) {
			throw new NotFoundError('Notification');
		}

		return notificationRepository.markAsRead(id);
	}

	/**
	 * Mark all notifications as read for a user
	 */
	async markAllAsRead(recipientId: string) {
		await notificationRepository.markAllAsRead(recipientId);

		return { message: 'All notifications marked as read' };
	}

	/**
	 * Delete a notification
	 */
	async deleteNotification(id: string, recipientId: string) {
		const notification = await notificationRepository.findById(id);

		if (!notification) {
			throw new NotFoundError('Notification');
		}

		if (notification.recipient_id !== recipientId) {
			throw new NotFoundError('Notification');
		}

		await notificationRepository.delete(id);

		return { message: 'Notification deleted successfully' };
	}
}

export const notificationService = new NotificationService();
