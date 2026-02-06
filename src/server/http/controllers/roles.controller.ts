import { Context } from 'hono';
import { roleService } from '@/server/services';
import { ValidationError } from '@/server/errors';
import { response, getPaginationParams } from '@/server/http/response';

export const rolesController = {
	/**
	 * GET /roles
	 * Get all roles with pagination
	 */
	async index(c: Context) {
		const { page, limit, search } = getPaginationParams(c);

		const result = await roleService.getAllRoles({ page, limit, search });

		return response.paginated(c, result.data, {
			page: result.meta.page,
			limit: result.meta.limit,
			total: result.meta.total,
			totalPages: result.meta.pages,
		}, 'OK');
	},


	/**
	 * GET /roles/:id
	 * Get role by ID
	 */
	async show(c: Context) {
		const id = c.req.param('id');
		const role = await roleService.getRoleById(id);

		return response.ok(c, role);
	},

	/**
	 * GET /roles/:id/users
	 * Get role with users
	 */
	async showWithUsers(c: Context) {
		const id = c.req.param('id');
		const role = await roleService.getRoleWithUsers(id);

		return response.ok(c, role);
	},

	/**
	 * GET /roles/:id/permissions
	 * Get role with permissions
	 */
	async showWithPermissions(c: Context) {
		const id = c.req.param('id');
		const role = await roleService.getRoleWithPermissions(id);

		return response.ok(c, role);
	},

	/**
	 * POST /roles
	 * Create new role
	 */
	async create(c: Context) {
		const body = await c.req.json();
		const { name } = body;

		if (!name) {
			throw new ValidationError('Validation failed', { name: ['Name is required'] });
		}

		const payload = c.get('user') as { auid: string };

		const role = await roleService.createRole({
			name,
			created_by: payload.auid,
		});

		return response.created(c, role, 'Role created successfully');
	},

	/**
	 * PUT /roles/:id
	 * Update role
	 */
	async update(c: Context) {
		const id = c.req.param('id');
		const body = await c.req.json();
		const { name } = body;

		const payload = c.get('user') as { auid: string };

		const role = await roleService.updateRole(id, {
			name,
			updated_by: payload.auid,
		});

		return response.ok(c, role, 'Role updated successfully');
	},

	/**
	 * DELETE /roles/:id
	 * Delete role
	 */
	async delete(c: Context) {
		const id = c.req.param('id');
		await roleService.deleteRole(id);

		return response.success(c, 'Role deleted successfully');
	},

	/**
	 * POST /roles/:id/permissions
	 * Assign permission to role
	 */
	async assignPermission(c: Context) {
		const roleId = c.req.param('id');
		const body = await c.req.json();
		const { permission_id } = body;

		if (!permission_id) {
			throw new ValidationError('Validation failed', { permission_id: ['Permission ID is required'] });
		}

		await roleService.assignPermissionToRole(roleId, permission_id);

		return response.success(c, 'Permission assigned successfully');
	},

	/**
	 * DELETE /roles/:id/permissions/:permissionId
	 * Remove permission from role
	 */
	async removePermission(c: Context) {
		const roleId = c.req.param('id');
		const permissionId = c.req.param('permissionId');

		await roleService.removePermissionFromRole(roleId, permissionId);

		return response.success(c, 'Permission removed successfully');
	},
};

