import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

/**
 * A single FAQ item, per content locale. Replaces the `translations.faqs.{id,en}` jsonb
 * array that used to live in `AppSettingsTable`. `sort_order` controls display order
 * (ascending), editable directly from the admin form — new items default to appending
 * to the end (see `FaqService.createFaq`).
 */
export const FaqsTable = pgTable('faqs', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	question: t.text('question').notNull(),
	answer: t.text('answer').notNull(),
	locale: t.varchar('locale', { length: 10 }).notNull(),
	sort_order: t.integer('sort_order').notNull().default(0),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
	updated_at: t.timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
	updated_by: t.varchar('updated_by'),
});

export type TSelectFaq = typeof FaqsTable.$inferSelect;
export type TInsertFaq = typeof FaqsTable.$inferInsert;
