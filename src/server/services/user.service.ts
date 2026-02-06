import bcrypt from 'bcrypt';
import { HTTPException } from 'hono/http-exception';
import { userRepository } from '@/server/repositories';
import type { TInsertUser, TSelectUser } from '@/server/databases/schemas/users';

export class UserService {
	/**
	 * Get all users with pagination
	 */
	async getAllUsers(options?: { page?: number; limit?: number; search?: string }) {
		const { page = 1, limit = 10, search } = options || {};

		const users = await userRepository.findAll({ page, limit, search });
		const total = await userRepository.count(search);

		return {
			data: users.map((user) => this.sanitizeUser(user)),
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get user by ID
	 */
	async getUserById(id: string) {
		const user = await userRepository.findById(id);

		if (!user) {
			throw new HTTPException(404, { message: 'User not found' });
		}

		return this.sanitizeUser(user);
	}

	/**
	 * Get user by ID with roles
	 */
	async getUserWithRoles(id: string) {
		const user = await userRepository.findByIdWithRoles(id);

		if (!user) {
			throw new HTTPException(404, { message: 'User not found' });
		}

		return {
			...this.sanitizeUser(user),
			roles: user.roles.map((r) => r.role),
		};
	}

	/**
	 * Create new user
	 */
	async createUser(data: { email: string; password: string; title?: string; created_by?: string }) {
		// Check if email already exists
		const existingUser = await userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new HTTPException(400, { message: 'Email already exists' });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(data.password, 10);

		const userData: TInsertUser = {
			email: data.email,
			password: hashedPassword,
			title: data.title,
			created_by: data.created_by,
		};

		const user = await userRepository.create(userData);

		return this.sanitizeUser(user);
	}

	/**
	 * Update user
	 */
	async updateUser(
		id: string,
		data: {
			email?: string;
			title?: string;
			password?: string;
			updated_by?: string;
		}
	) {
		const existingUser = await userRepository.findById(id);
		if (!existingUser) {
			throw new HTTPException(404, { message: 'User not found' });
		}

		// Check email uniqueness if email is being updated
		if (data.email && data.email !== existingUser.email) {
			const emailExists = await userRepository.findByEmail(data.email);
			if (emailExists) {
				throw new HTTPException(400, { message: 'Email already exists' });
			}
		}

		const updateData: Partial<TInsertUser> = {
			email: data.email,
			title: data.title,
			updated_by: data.updated_by,
		};

		// Hash password if provided
		if (data.password) {
			updateData.password = await bcrypt.hash(data.password, 10);
		}

		const user = await userRepository.update(id, updateData);

		if (!user) {
			throw new HTTPException(500, { message: 'Failed to update user' });
		}

		return this.sanitizeUser(user);
	}

	/**
	 * Delete user
	 */
	async deleteUser(id: string) {
		const existingUser = await userRepository.findById(id);
		if (!existingUser) {
			throw new HTTPException(404, { message: 'User not found' });
		}

		const deleted = await userRepository.delete(id);

		if (!deleted) {
			throw new HTTPException(500, { message: 'Failed to delete user' });
		}

		return { message: 'User deleted successfully' };
	}

	/**
	 * Assign role to user
	 */
	async assignRoleToUser(userId: string, roleId: string) {
		const user = await userRepository.findById(userId);
		if (!user) {
			throw new HTTPException(404, { message: 'User not found' });
		}

		await userRepository.assignRole(userId, roleId);

		return { message: 'Role assigned successfully' };
	}

	/**
	 * Remove role from user
	 */
	async removeRoleFromUser(userId: string, roleId: string) {
		const user = await userRepository.findById(userId);
		if (!user) {
			throw new HTTPException(404, { message: 'User not found' });
		}

		await userRepository.removeRole(userId, roleId);

		return { message: 'Role removed successfully' };
	}

	/**
	 * Verify user password
	 */
	async verifyPassword(email: string, password: string) {
		const user = await userRepository.findByEmail(email);
		if (!user) {
			return false;
		}

		return bcrypt.compare(password, user.password);
	}

	/**
	 * Remove sensitive data from user object
	 */
	private sanitizeUser(user: TSelectUser) {
		const { password, token_device, token_forgot_password, ...sanitized } = user;
		return sanitized;
	}
}

export const userService = new UserService();
