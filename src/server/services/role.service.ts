import { NotFoundError, ConflictError, InternalError } from '@/server/errors';
import { roleRepository } from '@/server/repositories';
import type { TInsertRole } from '@/server/databases/schemas/users';

export class RoleService {
	/**
	 * Get all roles with pagination
	 */
	async getAllRoles(options?: { page?: number; limit?: number; search?: string }) {
		const { page = 1, limit = 10, search } = options || {};

		const roles = await roleRepository.findAll({ page, limit, search });
		const total = await roleRepository.count(search);

		return {
			data: roles,
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get role by ID
	 */
	async getRoleById(id: string) {
		const role = await roleRepository.findById(id);

		if (!role) {
			throw new NotFoundError('Role');
		}

		return role;
	}

	/**
	 * Get role by ID with users
	 */
	async getRoleWithUsers(id: string) {
		const role = await roleRepository.findByIdWithUsers(id);

		if (!role) {
			throw new NotFoundError('Role');
		}

		return {
			...role,
			users: role.users.map((u) => u.user),
		};
	}

	/**
	 * Get role by ID with permissions
	 */
	async getRoleWithPermissions(id: string) {
		const role = await roleRepository.findByIdWithPermissions(id);

		if (!role) {
			throw new NotFoundError('Role');
		}

		return {
			...role,
			permissions: role.permissions.map((p) => p.permission),
		};
	}

	/**
	 * Create new role
	 */
	async createRole(data: { name: string; created_by?: string }) {
		// Check if name already exists
		const existingRole = await roleRepository.findByName(data.name);
		if (existingRole) {
			throw new ConflictError('Role name already exists');
		}

		const roleData: TInsertRole = {
			name: data.name,
			created_by: data.created_by,
		};

		const role = await roleRepository.create(roleData);

		return role;
	}

	/**
	 * Update role
	 */
	async updateRole(id: string, data: { name?: string; updated_by?: string }) {
		const existingRole = await roleRepository.findById(id);
		if (!existingRole) {
			throw new NotFoundError('Role');
		}

		// Check name uniqueness if name is being updated
		if (data.name && data.name !== existingRole.name) {
			const nameExists = await roleRepository.findByName(data.name);
			if (nameExists) {
				throw new ConflictError('Role name already exists');
			}
		}

		const updateData: Partial<TInsertRole> = {
			name: data.name,
			updated_by: data.updated_by,
		};

		const role = await roleRepository.update(id, updateData);

		if (!role) {
			throw new InternalError('Failed to update role');
		}

		return role;
	}

	/**
	 * Delete role
	 */
	async deleteRole(id: string) {
		const existingRole = await roleRepository.findById(id);
		if (!existingRole) {
			throw new NotFoundError('Role');
		}

		const deleted = await roleRepository.delete(id);

		if (!deleted) {
			throw new InternalError('Failed to delete role');
		}

		return { message: 'Role deleted successfully' };
	}

	/**
	 * Assign permission to role
	 */
	async assignPermissionToRole(roleId: string, permissionId: string) {
		const role = await roleRepository.findById(roleId);
		if (!role) {
			throw new NotFoundError('Role');
		}

		await roleRepository.assignPermission(roleId, permissionId);

		return { message: 'Permission assigned successfully' };
	}

	/**
	 * Remove permission from role
	 */
	async removePermissionFromRole(roleId: string, permissionId: string) {
		const role = await roleRepository.findById(roleId);
		if (!role) {
			throw new NotFoundError('Role');
		}

		await roleRepository.removePermission(roleId, permissionId);

		return { message: 'Permission removed successfully' };
	}
}

export const roleService = new RoleService();
