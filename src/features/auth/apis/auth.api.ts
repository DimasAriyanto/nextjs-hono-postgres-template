import { client, handleResponse, ApiError } from '@/libs/api';
import type {
	TLoginRequest,
	TRegisterRequest,
	TLoginResponse,
	TProfileResponse,
} from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

// ============================================
// AUTH API FUNCTIONS
// ============================================

/**
 * POST /api/v1/auths/login
 * Sign in user with email and password
 */
export async function login(request: TLoginRequest): Promise<ApiSuccessResponse<TLoginResponse>> {
	return handleResponse<TLoginResponse>(
		client.api.v1.auths.login.$post({ json: request })
	);
}

/**
 * POST /api/v1/auths/register
 * Register new user
 */
export async function register(request: TRegisterRequest): Promise<ApiSuccessResponse<TLoginResponse>> {
	return handleResponse<TLoginResponse>(
		client.api.v1.auths.register.$post({ json: request })
	);
}

/**
 * GET /api/v1/auths/profile
 * Get current user profile (requires auth)
 */
export async function getProfile(): Promise<ApiSuccessResponse<TProfileResponse>> {
	return handleResponse<TProfileResponse>(
		client.api.v1.auths.profile.$get()
	);
}

/**
 * GET /api/v1/auths/signout
 * Sign out user and clear session
 */
export async function logout(): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.auths.signout.$get()
	);
}

/**
 * POST /api/v1/auths/resend-verification
 * Resend email verification (requires auth)
 */
export async function resendVerification(): Promise<ApiSuccessResponse<null>> {
	return handleResponse<null>(
		client.api.v1.auths['resend-verification'].$post()
	);
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

/** @deprecated Use `login` instead */
export const signinRequest = login;

/** @deprecated Use `logout` instead */
export const requestLogout = logout;

// Re-export ApiError for error handling
export { ApiError };
