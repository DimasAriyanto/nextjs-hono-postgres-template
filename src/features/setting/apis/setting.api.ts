import { client, handleResponse, ApiError } from '@/libs/api';
import type { TSetting, TUpdateSettingRequest } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// SETTING API FUNCTIONS
// ============================================

/**
 * GET /api/v1/settings
 * Get application settings
 */
export async function getSettings(): Promise<ApiSuccessResponse<TSetting>> {
	return handleResponse<TSetting>(
		client.api.v1.settings.$get()
	);
}

/**
 * PUT /api/v1/settings
 * Update application settings
 */
export async function updateSettings(data: TUpdateSettingRequest): Promise<ApiSuccessResponse<TSetting>> {
	return handleResponse<TSetting>(
		client.api.v1.settings.$put({ json: data })
	);
}

// Re-export ApiError for error handling
export { ApiError };
