import { client } from './hono-client';
import type {
	ApiResponse,
	ApiSuccessResponse,
	ApiErrorResponse,
	ApiErrorDetails,
} from '@/types/api-response';

/**
 * Custom API error class with typed error details
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly code: string,
		public readonly type: string,
		public readonly details?: Record<string, string[]> | unknown
	) {
		super(message);
		this.name = 'ApiError';
	}

	/**
	 * Check if error is a validation error
	 */
	isValidationError(): boolean {
		return this.code === 'VALIDATION_ERROR';
	}

	/**
	 * Get validation errors for a specific field
	 */
	getFieldErrors(field: string): string[] {
		if (!this.isValidationError() || !this.details) return [];
		const details = this.details as Record<string, string[]>;
		return details[field] || [];
	}

	/**
	 * Get all field errors as flat object
	 */
	getAllFieldErrors(): Record<string, string[]> {
		if (!this.isValidationError() || !this.details) return {};
		return this.details as Record<string, string[]>;
	}

	/**
	 * Check if error is an auth error
	 */
	isAuthError(): boolean {
		return this.type === 'AuthError';
	}

	/**
	 * Check if error is not found
	 */
	isNotFound(): boolean {
		return this.code === 'RESOURCE_NOT_FOUND';
	}
}

/**
 * Type for hono client response
 */
type ClientResponse<T> = {
	ok: boolean;
	status: number;
	json: () => Promise<T>;
};

/**
 * Wrapper to handle API responses consistently
 * Automatically throws ApiError for error responses
 */
export async function handleResponse<T>(
	responsePromise: Promise<ClientResponse<ApiResponse<T>>>
): Promise<ApiSuccessResponse<T>> {
	const response = await responsePromise;
	const json = await response.json();

	if (!response.ok || 'errors' in json) {
		const errorResponse = json as ApiErrorResponse;
		throw new ApiError(
			errorResponse.message,
			response.status,
			errorResponse.errors.code,
			errorResponse.errors.type,
			errorResponse.errors.details
		);
	}

	return json as ApiSuccessResponse<T>;
}

/**
 * Wrapper that returns Result type instead of throwing
 */
export type Result<T, E = ApiError> =
	| { success: true; data: T }
	| { success: false; error: E };

export async function handleResponseSafe<T>(
	responsePromise: Promise<ClientResponse<ApiResponse<T>>>
): Promise<Result<ApiSuccessResponse<T>>> {
	try {
		const data = await handleResponse(responsePromise);
		return { success: true, data };
	} catch (error) {
		if (error instanceof ApiError) {
			return { success: false, error };
		}
		return {
			success: false,
			error: new ApiError(
				'An unexpected error occurred',
				500,
				'UNKNOWN_ERROR',
				'UnknownError'
			),
		};
	}
}

/**
 * Re-export client for convenience
 */
export { client };
