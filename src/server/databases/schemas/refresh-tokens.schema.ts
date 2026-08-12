import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { UsersTable } from './users.schema';

export const RefreshTokensTable = pgTable('refresh_tokens', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	user_id: t
		.uuid('user_id')
		.notNull()
		.references(() => UsersTable.id, { onDelete: 'cascade' }),
	token_hash: t.varchar('token_hash', { length: 255 }).unique().notNull(),
	expires_at: t.timestamp('expires_at', { mode: 'string' }).notNull(),
	revoked_at: t.timestamp('revoked_at', { mode: 'string' }),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export type TSelectRefreshToken = typeof RefreshTokensTable.$inferSelect;
export type TInsertRefreshToken = typeof RefreshTokensTable.$inferInsert;
