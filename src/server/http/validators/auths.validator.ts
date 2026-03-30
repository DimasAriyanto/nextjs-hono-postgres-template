import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, googleAuthSchema, updateProfileSchema, changePasswordSchema } from '@/contracts';
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

/**
 * Update profile request validator
 */
export const updateProfileRequest = validateJson(updateProfileSchema);

/**
 * Change password request validator
 */
export const changePasswordRequest = validateJson(changePasswordSchema);
