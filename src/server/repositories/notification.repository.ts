import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import {
	NotificationsTable,
	type TSelectNotification,
	type TInsertNotification,
} from '@/server/databases/schemas/notifications.schema';

export class NotificationRepository {
	/**
	 * Find notifications for a specific user
	 */
	async findByRecipient(
		recipientId: string,
		options?: { page?: number; limit?: number; isRead?: boolean }
	): Promise<TSelectNotification[]> {
		const { page = 1, limit = 20, isRead } = options || {};

		const conditions = [eq(NotificationsTable.recipient_id, recipientId)];
		if (isRead !== undefined) {
			conditions.push(eq(NotificationsTable.is_read, isRead));
		}

		return db
			.select()
			.from(NotificationsTable)
			.where(and(...conditions))
			.orderBy(desc(NotificationsTable.created_at))
			.limit(limit)
			.offset((page - 1) * limit);
	}

	/**
	 * Count notifications for a recipient
	 */
	async countByRecipient(recipientId: string, isRead?: boolean): Promise<number> {
		const conditions = [eq(NotificationsTable.recipient_id, recipientId)];
		if (isRead !== undefined) {
			conditions.push(eq(NotificationsTable.is_read, isRead));
		}

		const result = await db
			.select()
			.from(NotificationsTable)
			.where(and(...conditions));

		return result.length;
	}

	/**
	 * Find unread notifications for a recipient
	 */
	async findUnread(recipientId: string, limit = 10): Promise<TSelectNotification[]> {
		return db
			.select()
			.from(NotificationsTable)
			.where(
				and(
					eq(NotificationsTable.recipient_id, recipientId),
					eq(NotificationsTable.is_read, false)
				)
			)
			.orderBy(desc(NotificationsTable.created_at))
			.limit(limit);
	}

	/**
	 * Find notification by ID
	 */
	async findById(id: string): Promise<TSelectNotification | undefined> {
		const [notification] = await db
			.select()
			.from(NotificationsTable)
			.where(eq(NotificationsTable.id, id))
			.limit(1);

		return notification;
	}

	/**
	 * Create a new notification
	 */
	async create(data: TInsertNotification): Promise<TSelectNotification> {
		const [notification] = await db
			.insert(NotificationsTable)
			.values(data)
			.returning();

		return notification;
	}

	/**
	 * Mark a notification as read
	 */
	async markAsRead(id: string): Promise<TSelectNotification | undefined> {
		const [notification] = await db
			.update(NotificationsTable)
			.set({ is_read: true, read_at: new Date().toISOString() })
			.where(eq(NotificationsTable.id, id))
			.returning();

		return notification;
	}

	/**
	 * Mark all notifications as read for a recipient
	 */
	async markAllAsRead(recipientId: string): Promise<void> {
		await db
			.update(NotificationsTable)
			.set({ is_read: true, read_at: new Date().toISOString() })
			.where(
				and(
					eq(NotificationsTable.recipient_id, recipientId),
					eq(NotificationsTable.is_read, false)
				)
			);
	}

	/**
	 * Delete notification by ID
	 */
	async delete(id: string): Promise<boolean> {
		const result = await db
			.delete(NotificationsTable)
			.where(eq(NotificationsTable.id, id))
			.returning({ id: NotificationsTable.id });

		return result.length > 0;
	}
}

export const notificationRepository = new NotificationRepository();
