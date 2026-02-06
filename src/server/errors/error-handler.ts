import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { AppError, ValidationError } from './app-error';
import { getHttpStatus, getErrorTypeName } from './error-codes';

/**
 * Standard error response structure
 */
export interface ErrorResponse {
	message: string;
	data: null;
	errors: {
		code: string;
		type: string;
		details?: unknown;
	};
}

/**
 * Create a standardized error response
 */
function createErrorResponse(
	code: string,
	message: string,
	details?: unknown
): ErrorResponse {
	const response: ErrorResponse = {
		message,
		data: null,
		errors: {
			code,
			type: getErrorTypeName(code),
		},
	};

	if (details !== undefined) {
		response.errors.details = details;
	}

	return response;
}

/**
 * Global error handler for Hono app
 * Converts AppError instances to proper HTTP responses
 */
export function errorHandler(err: Error, c: Context) {
	console.error('[ERR]:', err);

	// Handle AppError and its subclasses
	if (err instanceof AppError) {
		const status = getHttpStatus(err.code) as ContentfulStatusCode;
		const details = err instanceof ValidationError ? err.fields : err.details;

		return c.json(createErrorResponse(err.code, err.message, details), status);
	}

	// Handle unknown errors
	return c.json(
		createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred'),
		500 as ContentfulStatusCode
	);
}
