import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, googleAuthSchema } from '@/contracts';
import { validateJson } from './helper';

/**
 * Login request validator
 */
export const loginRequest = validateJson(loginSchema);

/**
 * Register request validator
 */
export const registerRequest = validateJson(registerSchema);

/**
 * Forgot password request validator
 */
export const forgotPasswordRequest = validateJson(forgotPasswordSchema);

/**
 * Reset password request validator
 */
export const resetPasswordRequest = validateJson(resetPasswordSchema);

/**
 * Google OAuth request validator
 */
export const googleAuthRequest = validateJson(googleAuthSchema);
