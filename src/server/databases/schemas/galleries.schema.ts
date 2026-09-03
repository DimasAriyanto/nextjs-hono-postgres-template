import * as t from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const GalleriesTable = pgTable('galleries', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	url: t.text('url').notNull(),
	path: t.text('path').notNull(),
	filename: t.varchar('filename', { length: 255 }).notNull(),
	size: t.integer('size').notNull(),
	mime_type: t.varchar('mime_type', { length: 100 }).notNull(),
	alt_text: t.varchar('alt_text', { length: 255 }),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
});

export type TSelectGallery = typeof GalleriesTable.$inferSelect;
export type TInsertGallery = typeof GalleriesTable.$inferInsert;
