/**
 * Base application error class
 * Domain-specific errors that are agnostic of HTTP
 */
export class AppError extends Error {
	constructor(
		public readonly code: string,
		message: string,
		public readonly details?: unknown
	) {
		super(message);
		this.name = 'AppError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Validation error for request validation failures
 */
export class ValidationError extends AppError {
	constructor(
		message: string,
		public readonly fields?: Record<string, string[]>
	) {
		super('VALIDATION_ERROR', message, fields);
		this.name = 'ValidationError';
	}
}

/**
 * Authentication error for auth failures
 */
export class AuthError extends AppError {
	constructor(code: string, message: string) {
		super(code, message);
		this.name = 'AuthError';
	}

	static invalidCredentials() {
		return new AuthError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
	}

	static unauthorized() {
		return new AuthError('AUTH_UNAUTHORIZED', 'Authentication required');
	}

	static forbidden() {
		return new AuthError('AUTH_FORBIDDEN', 'Access denied');
	}

	static tokenExpired() {
		return new AuthError('AUTH_TOKEN_EXPIRED', 'Token has expired');
	}

	static tokenInvalid() {
		return new AuthError('AUTH_TOKEN_INVALID', 'Invalid token');
	}

	static emailNotVerified() {
		return new AuthError('AUTH_EMAIL_NOT_VERIFIED', 'Email not verified');
	}

	static emailAlreadyVerified() {
		return new AuthError('AUTH_EMAIL_ALREADY_VERIFIED', 'Email is already verified');
	}
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
	constructor(resource: string) {
		super('RESOURCE_NOT_FOUND', `${resource} not found`);
		this.name = 'NotFoundError';
	}
}

/**
 * Conflict error for duplicate resources
 */
export class ConflictError extends AppError {
	constructor(message: string) {
		super('RESOURCE_CONFLICT', message);
		this.name = 'ConflictError';
	}
}

/**
 * Internal error for unexpected failures
 */
export class InternalError extends AppError {
	constructor(message: string, details?: unknown) {
		super('INTERNAL_ERROR', message, details);
		this.name = 'InternalError';
	}
}
