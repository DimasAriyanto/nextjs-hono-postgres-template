import { client, handleResponse, ApiError } from '@/libs/api';
import type {
	TUser,
	TUserWithRoles,
	TCreateUserRequest,
	TUpdateUserRequest,
	TAssignRoleRequest,
} from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// USER API FUNCTIONS
// ============================================

/**
 * GET /api/v1/users
 * Get all users with pagination
 */
export async function getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<ApiSuccessResponse<TUser[]>> {
	return handleResponse<TUser[]>(
		client.api.v1.users.$get({ query: params as Record<string, string> })
	);
}

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
export async function getUserById(id: string): Promise<ApiSuccessResponse<TUser>> {
	return handleResponse<TUser>(
		client.api.v1.users[':id'].$get({ param: { id } })
	);
}

/**
 * GET /api/v1/users/:id/roles
 * Get user with roles
 */
export async function getUserWithRoles(id: string): Promise<ApiSuccessResponse<TUserWithRoles>> {
	return handleResponse<TUserWithRoles>(
		client.api.v1.users[':id'].roles.$get({ param: { id } })
	);
}

/**
 * POST /api/v1/users
 * Create new user
 */
export async function createUser(data: TCreateUserRequest): Promise<ApiSuccessResponse<TUser>> {
	return handleResponse<TUser>(
		client.api.v1.users.$post({ json: data })
	);
}

/**
 * PUT /api/v1/users/:id
 * Update user
 */
export async function updateUser(id: string, data: TUpdateUserRequest): Promise<ApiSuccessResponse<TUser>> {
	return handleResponse<TUser>(
		client.api.v1.users[':id'].$put({ param: { id }, json: data } as { param: { id: string }; json: TUpdateUserRequest })
	);
}

/**
 * DELETE /api/v1/users/:id
 * Delete user
 */
export async function deleteUser(id: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.users[':id'].$delete({ param: { id } })
	);
}

/**
 * POST /api/v1/users/:id/roles
 * Assign role to user
 */
export async function assignRole(id: string, data: TAssignRoleRequest): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.users[':id'].roles.$post({ param: { id }, json: data } as { param: { id: string }; json: TAssignRoleRequest })
	);
}

/**
 * DELETE /api/v1/users/:id/roles/:roleId
 * Remove role from user
 */
export async function removeRole(userId: string, roleId: string): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.users[':id'].roles[':roleId'].$delete({ param: { id: userId, roleId } })
	);
}

// Re-export ApiError for error handling
export { ApiError };
