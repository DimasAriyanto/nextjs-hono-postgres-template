import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const RolesTable = pgTable('roles', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	title: t.varchar('title', { length: 255 }).unique().notNull(),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
	updated_at: t.timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
	updated_by: t.varchar('updated_by'),
});

export const UsersTable = pgTable('users', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	email: t.varchar('email', { length: 255 }).unique().notNull(),
	password: t.varchar('password', { length: 255 }).notNull(),
	title: t.varchar('title', { length: 255 }),
	token_device: t.varchar('token_device', { length: 255 }),
	token_forgot_password: t.varchar('token_forgot_password', { length: 255 }),
	// Email verification fields
	email_verified_at: t.timestamp('email_verified_at', { mode: 'string' }),
	verification_token: t.varchar('verification_token', { length: 255 }),
	verification_token_expires_at: t.timestamp('verification_token_expires_at', { mode: 'string' }),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
	updated_at: t.timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
	updated_by: t.varchar('updated_by'),
});

export const RoleUserTable = pgTable(
	'user_role_links',
	{
		user_id: t
			.uuid('user_id')
			.notNull()
			.references(() => UsersTable.id, { onDelete: 'cascade' }),
		role_id: t
			.uuid('role_id')
			.notNull()
			.references(() => RolesTable.id, { onDelete: 'cascade' }),
	},
	(f) => [t.primaryKey({ columns: [f.user_id, f.role_id] })],
);

export const PermissionsTable = pgTable('permissions', {
	id: t.uuid('id').defaultRandom().primaryKey(),
	title: t.varchar('title', { length: 100 }).unique().notNull(),
	created_at: t.timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	created_by: t.varchar('created_by'),
	updated_at: t.timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
	updated_by: t.varchar('updated_by'),
});

export const RolePermissionTable = pgTable(
	'permission_role_links',
	{
		permission_id: t
			.uuid('permission_id')
			.notNull()
			.references(() => PermissionsTable.id, { onDelete: 'cascade' }),
		role_id: t
			.uuid('role_id')
			.notNull()
			.references(() => RolesTable.id, { onDelete: 'cascade' }),
	},
	(f) => [t.primaryKey({ columns: [f.role_id, f.permission_id] })],
);

/**
 * RELATIONS DESCRIPTION
 * ---------------------
 * Describe relation more detail for call in with on query process
 *
 */
export const RolesTableRelations = relations(RolesTable, ({ many }) => {
	return {
		users: many(RoleUserTable),
		permissions: many(RolePermissionTable),
	};
});

export const UsersTableRelations = relations(UsersTable, ({ many }) => {
	return {
		roles: many(RoleUserTable),
	};
});

export const RoleUserTableRelations = relations(RoleUserTable, ({ one }) => {
	return {
		user: one(UsersTable, { fields: [RoleUserTable.user_id], references: [UsersTable.id] }),
		role: one(RolesTable, { fields: [RoleUserTable.role_id], references: [RolesTable.id] }),
	};
});

export const PermissionsTableRelations = relations(PermissionsTable, ({ many }) => {
	return {
		roles: many(RolePermissionTable),
	};
});

export const RolePermissionTableRelations = relations(RolePermissionTable, ({ one }) => {
	return {
		permission: one(PermissionsTable, { fields: [RolePermissionTable.permission_id], references: [PermissionsTable.id] }),
		role: one(RolesTable, { fields: [RolePermissionTable.role_id], references: [RolesTable.id] }),
	};
});

/**
 * TYPES
 * ------------
 * Create and export types from schema to use in application
 *
 */
export type TSelectRole = typeof RolesTable.$inferSelect;
export type TInsertRole = typeof RolesTable.$inferInsert;
export type TSelectUser = typeof UsersTable.$inferSelect;
export type TInsertUser = typeof UsersTable.$inferInsert;
export type TSelectPermission = typeof PermissionsTable.$inferSelect;
export type TInsertPermission = typeof PermissionsTable.$inferInsert;
