import { client, handleResponse, ApiError } from '@/libs/api';
import type {
	TRole,
	TRoleWithUsers,
	TRoleWithPermissions,
	TCreateRoleRequest,
	TUpdateRoleRequest,
	TAssignPermissionRequest,
} from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// ROLE API FUNCTIONS
// ============================================

/**
 * GET /api/v1/roles
 * Get all roles with pagination
 */
export async function getRoles(params?: { page?: number; limit?: number; search?: string }): Promise<ApiSuccessResponse<TRole[]>> {
	return handleResponse<TRole[]>(
		client.api.v1.roles.$get({ query: params as Record<string, string> })
	);
}

/**
 * GET /api/v1/roles/:id
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<ApiSuccessResponse<TRole>> {
	return handleResponse<TRole>(
		client.api.v1.roles[':id'].$get({ param: { id } })
	);
}

/**
 * GET /api/v1/roles/:id/users
 * Get role with users
 */
export async function getRoleWithUsers(id: string): Promise<ApiSuccessResponse<TRoleWithUsers>> {
	return handleResponse<TRoleWithUsers>(
		client.api.v1.roles[':id'].users.$get({ param: { id } })
	);
}

/**
 * GET /api/v1/roles/:id/permissions
 * Get role with permissions
 */
export async function getRoleWithPermissions(id: string): Promise<ApiSuccessResponse<TRoleWithPermissions>> {
	return handleResponse<TRoleWithPermissions>(
		client.api.v1.roles[':id'].permissions.$get({ param: { id } })
	);
}

/**
 * POST /api/v1/roles
 * Create new role
 */
export async function createRole(data: TCreateRoleRequest): Promise<ApiSuccessResponse<TRole>> {
	return handleResponse<TRole>(
		client.api.v1.roles.$post({ json: data })
	);
}

/**
 * PUT /api/v1/roles/:id
 * Update role
 */
export async function updateRole(id: string, data: TUpdateRoleRequest): Promise<ApiSuccessResponse<TRole>> {
	return handleResponse<TRole>(
		client.api.v1.roles[':id'].$put({ param: { id }, json: data } as { param: { id: string }; json: TUpdateRoleRequest })
	);
}

/**
 * DELETE /api/v1/roles/:id
 * Delete role
 */
export async function deleteRole(id: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.roles[':id'].$delete({ param: { id } })
	);
}

/**
 * POST /api/v1/roles/:id/permissions
 * Assign permission to role
 */
export async function assignPermission(id: string, data: TAssignPermissionRequest): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.roles[':id'].permissions.$post({ param: { id }, json: data } as { param: { id: string }; json: TAssignPermissionRequest })
	);
}

/**
 * DELETE /api/v1/roles/:id/permissions/:permissionId
 * Remove permission from role
 */
export async function removePermission(roleId: string, permissionId: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.roles[':id'].permissions[':permissionId'].$delete({ param: { id: roleId, permissionId } })
	);
}

// Re-export ApiError for error handling
export { ApiError };
