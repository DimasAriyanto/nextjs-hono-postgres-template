import { createMiddleware } from 'hono/factory';
import { ValidationError } from '@/server/errors';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Cloudflare Turnstile server-side token verifier.
 *
 * Reads `cf_turnstile_token` from the JSON request body and validates it
 * against the Cloudflare Turnstile API using `TURNSTILE_SECRET_KEY`.
 *
 * Dev/test bypass: if `TURNSTILE_SECRET_KEY` is not set, verification is
 * skipped so local development works without needing real CAPTCHA keys.
 *
 * Usage — add to any route that needs bot protection:
 *   .post('/login', turnstileVerify, strictRateLimit, loginRequest, authController.login)
 */
export const turnstileVerify = createMiddleware(async (c, next) => {
	const secretKey = process.env.TURNSTILE_SECRET_KEY;

	// Dev bypass — skip if secret key is not configured
	if (!secretKey) {
		await next();
		return;
	}

	let token: string | undefined;

	try {
		const body = await c.req.json();
		token = body?.cf_turnstile_token;
	} catch {
		// Body already consumed or invalid JSON — treat as missing token
	}

	if (!token) {
		throw new ValidationError('CAPTCHA verification required', {
			cf_turnstile_token: ['Please complete the CAPTCHA challenge.'],
		});
	}

	// Verify token with Cloudflare
	const formData = new FormData();
	formData.append('secret', secretKey);
	formData.append('response', token);

	// Forward client IP if available (improves Turnstile accuracy)
	const clientIp =
		c.req.header('x-forwarded-for')?.split(',')[0].trim() ??
		c.req.header('x-real-ip');
	if (clientIp) {
		formData.append('remoteip', clientIp);
	}

	let success = false;
	try {
		const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: formData });
		const data = (await res.json()) as { success: boolean };
		success = data.success;
	} catch {
		// Network failure — fail open or closed based on your security posture.
		// Fail closed here: reject if we cannot reach Cloudflare.
		throw new ValidationError('CAPTCHA verification failed', {
			cf_turnstile_token: ['Could not verify CAPTCHA. Please try again.'],
		});
	}

	if (!success) {
		throw new ValidationError('CAPTCHA verification failed', {
			cf_turnstile_token: ['CAPTCHA challenge failed. Please try again.'],
		});
	}

	await next();
});
