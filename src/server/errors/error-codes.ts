import type { StatusCode } from 'hono/utils/http-status';

/**
 * Error code to HTTP status code mapping
 */
export const ERROR_HTTP_STATUS: Record<string, StatusCode> = {
	// Validation errors (400)
	VALIDATION_ERROR: 400,

	// Authentication errors
	AUTH_INVALID_CREDENTIALS: 401,
	AUTH_UNAUTHORIZED: 401,
	AUTH_FORBIDDEN: 403,
	AUTH_TOKEN_EXPIRED: 401,
	AUTH_TOKEN_INVALID: 401,
	AUTH_EMAIL_NOT_VERIFIED: 403,
	AUTH_EMAIL_ALREADY_VERIFIED: 400,

	// Resource errors
	RESOURCE_NOT_FOUND: 404,
	RESOURCE_CONFLICT: 400,

	// Internal errors (500)
	INTERNAL_ERROR: 500,
};

/**
 * Error type names for response
 */
export const ERROR_TYPE_NAMES: Record<string, string> = {
	VALIDATION_ERROR: 'ValidationError',
	AUTH_INVALID_CREDENTIALS: 'AuthError',
	AUTH_UNAUTHORIZED: 'AuthError',
	AUTH_FORBIDDEN: 'AuthError',
	AUTH_TOKEN_EXPIRED: 'AuthError',
	AUTH_TOKEN_INVALID: 'AuthError',
	AUTH_EMAIL_NOT_VERIFIED: 'AuthError',
	AUTH_EMAIL_ALREADY_VERIFIED: 'AuthError',
	RESOURCE_NOT_FOUND: 'NotFoundError',
	RESOURCE_CONFLICT: 'ConflictError',
	INTERNAL_ERROR: 'InternalError',
};

/**
 * Get HTTP status code for an error code
 */
export function getHttpStatus(code: string): StatusCode {
	return ERROR_HTTP_STATUS[code] || 500;
}

/**
 * Get error type name for an error code
 */
export function getErrorTypeName(code: string): string {
	return ERROR_TYPE_NAMES[code] || 'UnknownError';
}
