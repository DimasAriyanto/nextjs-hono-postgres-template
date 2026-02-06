import { Context } from 'hono';
import { roleService } from '@/server/services';

export const rolesController = {
	/**
	 * GET /roles
	 * Get all roles with pagination
	 */
	async index(c: Context) {
		try {
			const page = Number(c.req.query('page')) || 1;
			const limit = Number(c.req.query('limit')) || 10;
			const search = c.req.query('search') || undefined;

			const result = await roleService.getAllRoles({ page, limit, search });

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to fetch roles' }, error.status || 500);
		}
	},

	/**
	 * GET /roles/:id
	 * Get role by ID
	 */
	async show(c: Context) {
		try {
			const id = c.req.param('id');
			const role = await roleService.getRoleById(id);

			return c.json({ data: role }, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to fetch role' }, error.status || 500);
		}
	},

	/**
	 * GET /roles/:id/users
	 * Get role with users
	 */
	async showWithUsers(c: Context) {
		try {
			const id = c.req.param('id');
			const role = await roleService.getRoleWithUsers(id);

			return c.json({ data: role }, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to fetch role with users' }, error.status || 500);
		}
	},

	/**
	 * GET /roles/:id/permissions
	 * Get role with permissions
	 */
	async showWithPermissions(c: Context) {
		try {
			const id = c.req.param('id');
			const role = await roleService.getRoleWithPermissions(id);

			return c.json({ data: role }, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to fetch role with permissions' }, error.status || 500);
		}
	},

	/**
	 * POST /roles
	 * Create new role
	 */
	async create(c: Context) {
		try {
			const body = await c.req.json();
			const { title } = body;

			if (!title) {
				return c.json({ message: 'Title is required' }, 400);
			}

			const role = await roleService.createRole({
				title,
				created_by: 'system', // TODO: Get from authenticated user
			});

			return c.json({ data: role, message: 'Role created successfully' }, 201);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to create role' }, error.status || 500);
		}
	},

	/**
	 * PUT /roles/:id
	 * Update role
	 */
	async update(c: Context) {
		try {
			const id = c.req.param('id');
			const body = await c.req.json();
			const { title } = body;

			const role = await roleService.updateRole(id, {
				title,
				updated_by: 'system', // TODO: Get from authenticated user
			});

			return c.json({ data: role, message: 'Role updated successfully' }, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to update role' }, error.status || 500);
		}
	},

	/**
	 * DELETE /roles/:id
	 * Delete role
	 */
	async delete(c: Context) {
		try {
			const id = c.req.param('id');
			const result = await roleService.deleteRole(id);

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to delete role' }, error.status || 500);
		}
	},

	/**
	 * POST /roles/:id/permissions
	 * Assign permission to role
	 */
	async assignPermission(c: Context) {
		try {
			const roleId = c.req.param('id');
			const body = await c.req.json();
			const { permission_id } = body;

			if (!permission_id) {
				return c.json({ message: 'permission_id is required' }, 400);
			}

			const result = await roleService.assignPermissionToRole(roleId, permission_id);

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to assign permission' }, error.status || 500);
		}
	},

	/**
	 * DELETE /roles/:id/permissions/:permissionId
	 * Remove permission from role
	 */
	async removePermission(c: Context) {
		try {
			const roleId = c.req.param('id');
			const permissionId = c.req.param('permissionId');

			const result = await roleService.removePermissionFromRole(roleId, permissionId);

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to remove permission' }, error.status || 500);
		}
	},
};
