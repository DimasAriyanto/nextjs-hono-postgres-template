import { loginSchema, registerSchema } from '@/contracts';
import { validateJson } from './helper';

/**
 * Login request validator
 */
export const loginRequest = validateJson(loginSchema);

/**
 * Register request validator
 */
export const registerRequest = validateJson(registerSchema);
