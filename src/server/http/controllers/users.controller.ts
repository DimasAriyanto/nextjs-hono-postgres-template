import { Context } from 'hono';
import { userService } from '@/server/services';

export const usersController = {
	/**
	 * GET /users
	 * Get all users with pagination
	 */
	async index(c: Context) {
		try {
			const page = Number(c.req.query('page')) || 1;
			const limit = Number(c.req.query('limit')) || 10;
			const search = c.req.query('search') || undefined;

			const result = await userService.getAllUsers({ page, limit, search });

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to fetch users' }, error.status || 500);
		}
	},

	/**
	 * GET /users/:id
	 * Get user by ID
	 */
	async show(c: Context) {
		try {
			const id = c.req.param('id');
			const user = await userService.getUserById(id);

			return c.json({ data: user }, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to fetch user' }, error.status || 500);
		}
	},

	/**
	 * GET /users/:id/roles
	 * Get user with roles
	 */
	async showWithRoles(c: Context) {
		try {
			const id = c.req.param('id');
			const user = await userService.getUserWithRoles(id);

			return c.json({ data: user }, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to fetch user with roles' }, error.status || 500);
		}
	},

	/**
	 * POST /users
	 * Create new user
	 */
	async create(c: Context) {
		try {
			const body = await c.req.json();
			const { email, password, title } = body;

			if (!email || !password) {
				return c.json({ message: 'Email and password are required' }, 400);
			}

			const user = await userService.createUser({
				email,
				password,
				title,
				created_by: 'system', // TODO: Get from authenticated user
			});

			return c.json({ data: user, message: 'User created successfully' }, 201);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to create user' }, error.status || 500);
		}
	},

	/**
	 * PUT /users/:id
	 * Update user
	 */
	async update(c: Context) {
		try {
			const id = c.req.param('id');
			const body = await c.req.json();
			const { email, title, password } = body;

			const user = await userService.updateUser(id, {
				email,
				title,
				password,
				updated_by: 'system', // TODO: Get from authenticated user
			});

			return c.json({ data: user, message: 'User updated successfully' }, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to update user' }, error.status || 500);
		}
	},

	/**
	 * DELETE /users/:id
	 * Delete user
	 */
	async delete(c: Context) {
		try {
			const id = c.req.param('id');
			const result = await userService.deleteUser(id);

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to delete user' }, error.status || 500);
		}
	},

	/**
	 * POST /users/:id/roles
	 * Assign role to user
	 */
	async assignRole(c: Context) {
		try {
			const userId = c.req.param('id');
			const body = await c.req.json();
			const { role_id } = body;

			if (!role_id) {
				return c.json({ message: 'role_id is required' }, 400);
			}

			const result = await userService.assignRoleToUser(userId, role_id);

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to assign role' }, error.status || 500);
		}
	},

	/**
	 * DELETE /users/:id/roles/:roleId
	 * Remove role from user
	 */
	async removeRole(c: Context) {
		try {
			const userId = c.req.param('id');
			const roleId = c.req.param('roleId');

			const result = await userService.removeRoleFromUser(userId, roleId);

			return c.json(result, 200);
		} catch (error: any) {
			return c.json({ message: error.message || 'Failed to remove role' }, error.status || 500);
		}
	},
};
