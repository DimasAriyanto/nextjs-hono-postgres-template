import { and, eq } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { PermissionsTable, RolePermissionTable, RoleUserTable, type TSelectPermission } from '@/server/databases/schemas/users.schema';

export class PermissionRepository {
	/**
	 * Find all permissions
	 */
	async findAll(): Promise<TSelectPermission[]> {
		return db.select().from(PermissionsTable);
	}

	/**
	 * Check whether a user has a given permission through any of their roles
	 */
	async userHasPermission(userId: string, key: string): Promise<boolean> {
		const [result] = await db
			.select({ id: PermissionsTable.id })
			.from(RoleUserTable)
			.innerJoin(RolePermissionTable, eq(RolePermissionTable.role_id, RoleUserTable.role_id))
			.innerJoin(PermissionsTable, eq(PermissionsTable.id, RolePermissionTable.permission_id))
			.where(and(eq(RoleUserTable.user_id, userId), eq(PermissionsTable.name, key)))
			.limit(1);

		return !!result;
	}

	/**
	 * Get the distinct permission names a user has through any of their roles
	 */
	async findKeysForUser(userId: string): Promise<string[]> {
		const rows = await db
			.selectDistinct({ name: PermissionsTable.name })
			.from(RoleUserTable)
			.innerJoin(RolePermissionTable, eq(RolePermissionTable.role_id, RoleUserTable.role_id))
			.innerJoin(PermissionsTable, eq(PermissionsTable.id, RolePermissionTable.permission_id))
			.where(eq(RoleUserTable.user_id, userId));

		return rows.map((r) => r.name);
	}
}

export const permissionRepository = new PermissionRepository();
