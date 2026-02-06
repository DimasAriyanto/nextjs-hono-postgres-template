/**
 * Pagination metadata from API
 */
export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

/**
 * Error details from API
 */
export interface ApiErrorDetails {
	code: string;
	type: string;
	details?: Record<string, string[]> | unknown;
}

/**
 * Success response from API
 */
export interface ApiSuccessResponse<T = unknown> {
	success: true;
	message: string;
	data: T;
	meta?: {
		pagination?: PaginationMeta;
	};
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
	success?: false;
	message: string;
	data: null;
	errors: ApiErrorDetails;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Type guard to check if response is success
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
	return 'success' in response && response.success === true;
}

/**
 * Type guard to check if response is error
 */
export function isApiError(response: ApiResponse<unknown>): response is ApiErrorResponse {
	return 'errors' in response;
}
