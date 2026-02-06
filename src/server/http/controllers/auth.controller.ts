import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { setSignedCookie, deleteCookie } from 'hono/cookie';
import { authService } from '@/server/services';

export const authController = {
	/**
	 * POST /auths/signin
	 * Sign in user
	 */
	async login(c: Context) {
		const body = await c.req.json();
		const result = await authService.login(body);

		// Set cookie
		const cookieConfig = authService.getCookieConfig();
		await setSignedCookie(c, cookieConfig.name, result.token, cookieConfig.secret, cookieConfig.options);

		return c.json({ message: 'OK', data: result }, 200);
	},

	/**
	 * POST /auths/register
	 * Register new user
	 */
	async register(c: Context) {
		const body = await c.req.json();
		const result = await authService.register(body);

		// Set cookie for auto-login
		const cookieConfig = authService.getCookieConfig();
		await setSignedCookie(c, cookieConfig.name, result.token, cookieConfig.secret, cookieConfig.options);

		return c.json({ message: 'Registration successful', data: result }, 201);
	},

	/**
	 * GET /auths/profile
	 * Get current user profile
	 */
	async profile(c: Context) {
		const payload = c.get('user') as { auid: string };

		if (!payload?.auid) {
			throw new HTTPException(401, { message: 'Unauthorized' });
		}

		const user = await authService.getProfile(payload.auid);

		return c.json({ message: 'OK', data: user }, 200);
	},

	/**
	 * GET /auths/verify-email
	 * Verify email with token
	 */
	async verifyEmail(c: Context) {
		const token = c.req.query('token');

		if (!token) {
			throw new HTTPException(400, { message: 'Verification token is required' });
		}

		await authService.verifyEmail(token);

		// Redirect to success page
		const redirectUrl = process.env.APP_URL + '/email-verified';
		return c.redirect(redirectUrl);
	},

	/**
	 * POST /auths/resend-verification
	 * Resend verification email
	 */
	async resendVerification(c: Context) {
		const payload = c.get('user') as { auid: string };

		if (!payload?.auid) {
			throw new HTTPException(401, { message: 'Unauthorized' });
		}

		const result = await authService.resendVerificationEmail(payload.auid);

		return c.json({ message: result.message }, 200);
	},

	/**
	 * GET /auths/signout
	 * Sign out user
	 */
	async signout(c: Context) {
		const cookieConfig = authService.getCookieConfig();
		deleteCookie(c, cookieConfig.name);

		return c.json({ message: 'OK' }, 200);
	},
};
