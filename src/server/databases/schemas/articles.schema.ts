import { relations, sql } from 'drizzle-orm';
import { pgTable, pgEnum } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { UsersTable } from './users.schema';
import { ArticleCategoriesTable } from './article-categories.schema';

export const articleStatusEnum = pgEnum('article_status', ['draft', 'published']);

export const ArticlesTable = pgTable('articles', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	title: t.varchar('title', { length: 255 }).notNull(),
	slug: t.varchar('slug', { length: 255 }).unique().notNull(),
	excerpt: t.text('excerpt'),
	content: t.text('content').notNull(),
	thumbnail_url: t.text('thumbnail_url'),
	status: articleStatusEnum('status').notNull().default('draft'),
	published_at: t.timestamp('published_at', { mode: 'string' }),
	author_id: t.uuid('author_id').references(() => UsersTable.id, { onDelete: 'set null' }),
	category_id: t.uuid('category_id').references(() => ArticleCategoriesTable.id, { onDelete: 'set null' }),
	tags: t.text('tags').array().notNull().default(sql`'{}'::text[]`),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
	updated_at: t.timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
	updated_by: t.varchar('updated_by'),
});

export const ArticlesTableRelations = relations(ArticlesTable, ({ one }) => {
	return {
		author: one(UsersTable, { fields: [ArticlesTable.author_id], references: [UsersTable.id] }),
		category: one(ArticleCategoriesTable, { fields: [ArticlesTable.category_id], references: [ArticleCategoriesTable.id] }),
	};
});

export type TSelectArticle = typeof ArticlesTable.$inferSelect;
export type TInsertArticle = typeof ArticlesTable.$inferInsert;
