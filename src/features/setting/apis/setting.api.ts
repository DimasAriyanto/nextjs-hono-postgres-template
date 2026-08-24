import { client, handleResponse, ApiError } from '@/libs/api';
import type { TContentLocale, TSetting, TUpdateSettingRequest } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// SETTING API FUNCTIONS
// ============================================

/**
 * GET /api/v1/settings
 * Get application settings. `contentLocale` resolves the translatable fields
 * (about_content, terms_of_service, privacy_policy, faqs, banners) for that
 * language — omit it to get the default content locale.
 */
export async function getSettings(contentLocale?: TContentLocale): Promise<ApiSuccessResponse<TSetting>> {
	return handleResponse<TSetting>(
		client.api.v1.settings.$get({ query: contentLocale ? { locale: contentLocale } : undefined })
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
