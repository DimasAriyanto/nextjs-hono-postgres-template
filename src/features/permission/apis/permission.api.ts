import { client, handleResponse, ApiError } from '@/libs/api';
import type { TPermission } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

/**
 * GET /api/v1/permissions
 * Get all permissions
 */
export async function getPermissions(): Promise<ApiSuccessResponse<TPermission[]>> {
	return handleResponse<TPermission[]>(
		client.api.v1.permissions.$get()
	);
}

// Re-export ApiError for error handling
export { ApiError };
