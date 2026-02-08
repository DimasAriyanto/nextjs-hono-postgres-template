import { NotFoundError, ConflictError, InternalError } from '@/server/errors';
import { userRepository } from '@/server/repositories';
import { hashPassword, comparePassword } from '@/server/utils';
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
			data: users.map((user) => ({
				...this.sanitizeUser(user),
				roles: user.roles.map((r) => r.role),
			})),
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
			throw new NotFoundError('User');
		}

		return this.sanitizeUser(user);
	}

	/**
	 * Get user by ID with roles
	 */
	async getUserWithRoles(id: string) {
		const user = await userRepository.findByIdWithRoles(id);

		if (!user) {
			throw new NotFoundError('User');
		}

		return {
			...this.sanitizeUser(user),
			roles: user.roles.map((r) => r.role),
		};
	}

	/**
	 * Create new user
	 */
	async createUser(data: { email: string; password: string; name?: string; role_id?: string; created_by?: string }) {
		// Check if email already exists
		const existingUser = await userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new ConflictError('Email already exists');
		}

		// Hash password
		const hashedPassword = await hashPassword(data.password);

		const userData: TInsertUser = {
			email: data.email,
			password: hashedPassword,
			name: data.name,
			created_by: data.created_by,
		};

		const user = await userRepository.create(userData);

		// Assign role if provided
		if (data.role_id) {
			await userRepository.assignRole(user.id, data.role_id);
		}

		return this.sanitizeUser(user);
	}

	/**
	 * Update user
	 */
	async updateUser(
		id: string,
		data: {
			email?: string;
			name?: string;
			password?: string;
			role_id?: string;
			updated_by?: string;
		}
	) {
		const existingUser = await userRepository.findById(id);
		if (!existingUser) {
			throw new NotFoundError('User');
		}

		// Check email uniqueness if email is being updated
		if (data.email && data.email !== existingUser.email) {
			const emailExists = await userRepository.findByEmail(data.email);
			if (emailExists) {
				throw new ConflictError('Email already exists');
			}
		}

		const updateData: Partial<TInsertUser> = {
			email: data.email,
			name: data.name,
			updated_by: data.updated_by,
		};

		// Hash password if provided
		if (data.password) {
			updateData.password = await hashPassword(data.password);
		}

		const user = await userRepository.update(id, updateData);

		if (!user) {
			throw new InternalError('Failed to update user');
		}

		// Update role if provided: remove existing roles, then assign new one
		if (data.role_id) {
			const existingRoles = await userRepository.getUserRoles(id);
			for (const existingRole of existingRoles) {
				await userRepository.removeRole(id, existingRole.role_id);
			}
			await userRepository.assignRole(id, data.role_id);
		}

		return this.sanitizeUser(user);
	}

	/**
	 * Delete user
	 */
	async deleteUser(id: string) {
		const existingUser = await userRepository.findById(id);
		if (!existingUser) {
			throw new NotFoundError('User');
		}

		const deleted = await userRepository.delete(id);

		if (!deleted) {
			throw new InternalError('Failed to delete user');
		}

		return { message: 'User deleted successfully' };
	}

	/**
	 * Assign role to user
	 */
	async assignRoleToUser(userId: string, roleId: string) {
		const user = await userRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('User');
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
			throw new NotFoundError('User');
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

		return comparePassword(password, user.password);
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
