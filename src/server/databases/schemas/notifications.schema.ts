import { pgTable, pgEnum } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { UsersTable } from './users.schema';

export const notificationTypeEnum = pgEnum('notification_type', [
	'system',
	'info',
	'warning',
	'success',
	'error',
]);

export const NotificationsTable = pgTable('notifications', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	recipient_id: t
		.uuid('recipient_id')
		.references(() => UsersTable.id, { onDelete: 'cascade' })
		.notNull(),
	type: notificationTypeEnum('type').notNull().default('info'),
	title: t.varchar('title', { length: 255 }).notNull(),
	message: t.text('message').notNull(),
	is_read: t.boolean('is_read').notNull().default(false),
	read_at: t.timestamp('read_at', { mode: 'string' }),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
});

export type TSelectNotification = typeof NotificationsTable.$inferSelect;
export type TInsertNotification = typeof NotificationsTable.$inferInsert;
