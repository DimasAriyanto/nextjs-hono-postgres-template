import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const ArticleCategoriesTable = pgTable('article_categories', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	name: t.varchar('name', { length: 100 }).unique().notNull(),
	slug: t.varchar('slug', { length: 100 }).unique().notNull(),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
	updated_at: t.timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
	updated_by: t.varchar('updated_by'),
});

export type TSelectArticleCategory = typeof ArticleCategoriesTable.$inferSelect;
export type TInsertArticleCategory = typeof ArticleCategoriesTable.$inferInsert;
