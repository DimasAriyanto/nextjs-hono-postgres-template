import { Context } from 'hono';
import { userService } from '@/server/services';
import { ValidationError } from '@/server/errors';
import { response, getPaginationParams } from '@/server/http/response';

export const usersController = {
	/**
	 * GET /users
	 * Get all users with pagination
	 */
	async index(c: Context) {
		const { page, limit, search } = getPaginationParams(c);

		const result = await userService.getAllUsers({ page, limit, search });

		return response.paginated(c, result.data, {
			page: result.meta.page,
			limit: result.meta.limit,
			total: result.meta.total,
			totalPages: result.meta.pages,
		}, 'OK');
	},


	/**
	 * GET /users/:id
	 * Get user by ID
	 */
	async show(c: Context) {
		const id = c.req.param('id');
		const user = await userService.getUserById(id);

		return response.ok(c, user);
	},

	/**
	 * GET /users/:id/roles
	 * Get user with roles
	 */
	async showWithRoles(c: Context) {
		const id = c.req.param('id');
		const user = await userService.getUserWithRoles(id);

		return response.ok(c, user);
	},

	/**
	 * POST /users
	 * Create new user
	 */
	async create(c: Context) {
		const body = await c.req.json();
		const { email, password, name } = body;

		if (!email || !password) {
			throw new ValidationError('Validation failed', {
				...((!email) && { email: ['Email is required'] }),
				...((!password) && { password: ['Password is required'] }),
			});
		}

		const user = await userService.createUser({
			email,
			password,
			name,
			created_by: 'system', // TODO: Get from authenticated user
		});

		return response.created(c, user, 'User created successfully');
	},

	/**
	 * PUT /users/:id
	 * Update user
	 */
	async update(c: Context) {
		const id = c.req.param('id');
		const body = await c.req.json();
		const { email, name, password } = body;

		const user = await userService.updateUser(id, {
			email,
			name,
			password,
			updated_by: 'system', // TODO: Get from authenticated user
		});

		return response.ok(c, user, 'User updated successfully');
	},

	/**
	 * DELETE /users/:id
	 * Delete user
	 */
	async delete(c: Context) {
		const id = c.req.param('id');
		await userService.deleteUser(id);

		return response.success(c, 'User deleted successfully');
	},

	/**
	 * POST /users/:id/roles
	 * Assign role to user
	 */
	async assignRole(c: Context) {
		const userId = c.req.param('id');
		const body = await c.req.json();
		const { role_id } = body;

		if (!role_id) {
			throw new ValidationError('Validation failed', { role_id: ['Role ID is required'] });
		}

		await userService.assignRoleToUser(userId, role_id);

		return response.success(c, 'Role assigned successfully');
	},

	/**
	 * DELETE /users/:id/roles/:roleId
	 * Remove role from user
	 */
	async removeRole(c: Context) {
		const userId = c.req.param('id');
		const roleId = c.req.param('roleId');

		await userService.removeRoleFromUser(userId, roleId);

		return response.success(c, 'Role removed successfully');
	},
};

