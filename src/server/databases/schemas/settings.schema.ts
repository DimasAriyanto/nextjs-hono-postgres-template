import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

/**
 * Generic key/group settings store — each row is one setting.
 * `value` is jsonb so a setting can hold a string, number, boolean or object/array
 * (e.g. social links) without needing a schema migration for every new field.
 *
 * `locale` distinguishes per-language rows for translatable content keys
 * (about_content, terms_of_service, privacy_policy, faqs, banners) — an empty
 * string means the row is global/shared across all content locales, which is
 * true for every other key.
 */
export const AppSettingsTable = pgTable('app_settings', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	key: t.varchar('key', { length: 100 }).notNull(),
	locale: t.varchar('locale', { length: 10 }).notNull().default(''),
	group: t.varchar('group', { length: 50 }).notNull().default('general'),
	value: t.jsonb('value'),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
	updated_at: t.timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
	updated_by: t.varchar('updated_by'),
}, (table) => [
	t.uniqueIndex('app_settings_key_locale_idx').on(table.key, table.locale),
]);

export type TSelectAppSetting = typeof AppSettingsTable.$inferSelect;
export type TInsertAppSetting = typeof AppSettingsTable.$inferInsert;
