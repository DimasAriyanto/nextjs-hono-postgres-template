import { eq, ilike, and } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import {
	RolesTable,
	RolePermissionTable,
	type TSelectRole,
	type TInsertRole,
} from '@/server/databases/schemas/users';

export class RoleRepository {
	/**
	 * Find all roles with pagination and search
	 */
	async findAll(options?: { page?: number; limit?: number; search?: string }) {
		const { page = 1, limit = 10, search } = options || {};

		let query = db.select().from(RolesTable).$dynamic();

		if (search) {
			query = query.where(ilike(RolesTable.name, `%${search}%`));
		}

		const results = await query.limit(limit).offset((page - 1) * limit);

		return results;
	}

	/**
	 * Find role by ID
	 */
	async findById(id: string): Promise<TSelectRole | undefined> {
		const [role] = await db.select().from(RolesTable).where(eq(RolesTable.id, id)).limit(1);

		return role;
	}

	/**
	 * Find role by name
	 */
	async findByName(name: string): Promise<TSelectRole | undefined> {
		const [role] = await db.select().from(RolesTable).where(eq(RolesTable.name, name)).limit(1);

		return role;
	}

	/**
	 * Find role with users
	 */
	async findByIdWithUsers(id: string) {
		const role = await db.query.RolesTable.findFirst({
			where: eq(RolesTable.id, id),
			with: {
				users: {
					with: {
						user: true,
					},
				},
			},
		});

		return role;
	}

	/**
	 * Find role with permissions
	 */
	async findByIdWithPermissions(id: string) {
		const role = await db.query.RolesTable.findFirst({
			where: eq(RolesTable.id, id),
			with: {
				permissions: {
					with: {
						permission: true,
					},
				},
			},
		});

		return role;
	}

	/**
	 * Create new role
	 */
	async create(data: TInsertRole): Promise<TSelectRole> {
		const [role] = await db.insert(RolesTable).values(data).returning();

		return role;
	}

	/**
	 * Update role by ID
	 */
	async update(id: string, data: Partial<TInsertRole>): Promise<TSelectRole | undefined> {
		const [role] = await db
			.update(RolesTable)
			.set({ ...data, updated_at: new Date().toISOString() })
			.where(eq(RolesTable.id, id))
			.returning();

		return role;
	}

	/**
	 * Delete role by ID
	 */
	async delete(id: string): Promise<boolean> {
		const result = await db.delete(RolesTable).where(eq(RolesTable.id, id)).returning({ id: RolesTable.id });

		return result.length > 0;
	}

	/**
	 * Assign permission to role
	 */
	async assignPermission(roleId: string, permissionId: string): Promise<void> {
		await db.insert(RolePermissionTable).values({ role_id: roleId, permission_id: permissionId }).onConflictDoNothing();
	}

	/**
	 * Remove permission from role
	 */
	async removePermission(roleId: string, permissionId: string): Promise<void> {
		await db
			.delete(RolePermissionTable)
			.where(and(eq(RolePermissionTable.role_id, roleId), eq(RolePermissionTable.permission_id, permissionId)));
	}

	/**
	 * Get role permissions
	 */
	async getRolePermissions(roleId: string) {
		const permissions = await db.select().from(RolePermissionTable).where(eq(RolePermissionTable.role_id, roleId));

		return permissions;
	}

	/**
	 * Count total roles
	 */
	async count(search?: string): Promise<number> {
		let query = db.select().from(RolesTable).$dynamic();

		if (search) {
			query = query.where(ilike(RolesTable.name, `%${search}%`));
		}

		const result = await query;
		return result.length;
	}
}

export const roleRepository = new RoleRepository();
