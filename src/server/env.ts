import { z } from 'zod';

/**
 * Validated env vars for the security-critical surface: JWT/cookie signing secrets
 * and the origins used for CORS/CSRF/OAuth audience checks. Parsed once at module
 * load so a missing/weak secret fails fast at boot instead of surfacing later as
 * `sign(payload, undefined)` or an unverifiable cookie.
 *
 * Other env vars (mail, storage drivers, upload limits, locale, DB — see
 * src/server/databases/client.ts for DB's own validation) are intentionally out of
 * scope here.
 */
const envSchema = z.object({
	APP_KEY: z.string().min(16, 'APP_KEY must be at least 16 characters'),
	APP_COOKIE_KEY: z.string().min(16, 'APP_COOKIE_KEY must be at least 16 characters'),
	NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
	NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
