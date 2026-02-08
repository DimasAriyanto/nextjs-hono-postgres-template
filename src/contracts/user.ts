import { z } from 'zod';

// ============================================
// REQUEST SCHEMAS
// ============================================

/**
 * Create user request schema
 */
export const createUserSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email format'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	name: z.string().optional(),
	role_id: z.string().uuid('Invalid role ID').optional(),
});

export type TCreateUserRequest = z.infer<typeof createUserSchema>;

/**
 * Update user request schema
 */
export const updateUserSchema = z.object({
	email: z.string().email('Invalid email format').optional(),
	password: z.string().min(6, 'Password must be at least 6 characters').optional(),
	name: z.string().optional(),
	role_id: z.string().uuid('Invalid role ID').optional(),
});

export type TUpdateUserRequest = z.infer<typeof updateUserSchema>;

/**
 * Assign role request schema
 */
export const assignRoleSchema = z.object({
	role_id: z.string().uuid('Invalid role ID'),
});

export type TAssignRoleRequest = z.infer<typeof assignRoleSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

/**
 * User response (sanitized)
 */
export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string().nullable().optional(),
	email_verified_at: z.string().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string(),
	created_by: z.string().nullable().optional(),
	updated_by: z.string().nullable().optional(),
});

export type TUser = z.infer<typeof userSchema>;

/**
 * User with roles response
 */
export const userWithRolesSchema = userSchema.extend({
	roles: z.array(z.unknown()),
});

export type TUserWithRoles = z.infer<typeof userWithRolesSchema>;
