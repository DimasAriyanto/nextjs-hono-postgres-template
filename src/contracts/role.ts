import { z } from 'zod';

// ============================================
// REQUEST SCHEMAS
// ============================================

/**
 * Create role request schema
 */
export const createRoleSchema = z.object({
	name: z.string().min(1, 'Name is required'),
});

export type TCreateRoleRequest = z.infer<typeof createRoleSchema>;

/**
 * Update role request schema
 */
export const updateRoleSchema = z.object({
	name: z.string().min(1, 'Name is required').optional(),
});

export type TUpdateRoleRequest = z.infer<typeof updateRoleSchema>;

/**
 * Assign permission request schema
 */
export const assignPermissionSchema = z.object({
	permission_id: z.string().uuid('Invalid permission ID'),
});

export type TAssignPermissionRequest = z.infer<typeof assignPermissionSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

/**
 * Role response
 */
export const roleSchema = z.object({
	id: z.string(),
	name: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	created_by: z.string().nullable().optional(),
	updated_by: z.string().nullable().optional(),
});

export type TRole = z.infer<typeof roleSchema>;

/**
 * Role with users response
 */
export const roleWithUsersSchema = roleSchema.extend({
	users: z.array(z.unknown()),
});

export type TRoleWithUsers = z.infer<typeof roleWithUsersSchema>;

/**
 * Role with permissions response
 */
export const roleWithPermissionsSchema = roleSchema.extend({
	permissions: z.array(z.unknown()),
});

export type TRoleWithPermissions = z.infer<typeof roleWithPermissionsSchema>;
