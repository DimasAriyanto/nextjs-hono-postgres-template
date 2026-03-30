import { z } from 'zod';

// ============================================
// REQUEST SCHEMAS
// ============================================

/**
 * Login request schema
 */
export const loginSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email format'),
	password: z.string().min(1, 'Password is required'),
});

export type TLoginRequest = z.infer<typeof loginSchema>;

/**
 * Register request schema
 */
export const registerSchema = z
	.object({
		email: z.string().min(1, 'Email is required').email('Invalid email format'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		password_confirmation: z.string().min(1, 'Password confirmation is required'),
		title: z.string().optional(),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: 'Passwords do not match',
		path: ['password_confirmation'],
	});

export type TRegisterRequest = z.infer<typeof registerSchema>;

/**
 * Google OAuth request schema
 */
export const googleAuthSchema = z.object({
	token: z.string().min(1, 'Google token is required'),
});

export type TGoogleAuthRequest = z.infer<typeof googleAuthSchema>;

/**
 * Forgot password request schema
 */
export const forgotPasswordSchema = z.object({
	email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

export type TForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password request schema
 */
export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, 'Token tidak valid'),
		password: z.string().min(6, 'Password minimal 6 karakter'),
		password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: 'Password tidak cocok',
		path: ['password_confirmation'],
	});

export type TResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

/**
 * Auth user response (sanitized, no password)
 */
export const authUserSchema = z.object({
	id: z.string(),
	email: z.string(),
	title: z.string().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string(),
});

export type TAuthUser = z.infer<typeof authUserSchema>;

/**
 * Login response
 */
export const loginResponseSchema = z.object({
	user: authUserSchema,
	token: z.string(),
	permissions: z.unknown().nullable(),
	email_verified: z.boolean(),
	is_admin: z.boolean(),
});

export type TLoginResponse = z.infer<typeof loginResponseSchema>;

/**
 * Register response
 */
export const registerResponseSchema = loginResponseSchema.extend({
	message: z.string().optional(),
});

export type TRegisterResponse = z.infer<typeof registerResponseSchema>;

/**
 * Profile response
 */
export const profileResponseSchema = authUserSchema.extend({
	roles: z.array(z.object({ id: z.string(), name: z.string(), is_admin: z.boolean(), is_default: z.boolean() })).optional(),
	email_verified: z.boolean(),
});

export type TProfileResponse = z.infer<typeof profileResponseSchema>;

// ============================================
// TOKEN
// ============================================

/**
 * JWT token payload (decoded token)
 */
export const tokenPayloadSchema = z.object({
	exp: z.number(),
	iat: z.number(),
	auid: z.string(),
	aurl: z.string().nullable(),
	uenv: z.string().optional(),
	utid: z.string().optional(),
	auem: z.string().optional(),
});

export type TTokenPayload = z.infer<typeof tokenPayloadSchema>;

/** @deprecated Use TTokenPayload instead */
export type TTokenDecoded = TTokenPayload;
