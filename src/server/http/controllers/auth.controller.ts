import { Context } from 'hono';
import { setSignedCookie, deleteCookie } from 'hono/cookie';
import { authService } from '@/server/services';
import { AuthError, ValidationError } from '@/server/errors';
import { response } from '@/server/http/response';

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

		return response.ok(c, result, 'Login successful');
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

		return response.created(c, result, 'Registration successful');
	},

	/**
	 * GET /auths/profile
	 * Get current user profile
	 */
	async profile(c: Context) {
		const payload = c.get('user') as { auid: string };

		if (!payload?.auid) {
			throw AuthError.unauthorized();
		}

		const user = await authService.getProfile(payload.auid);

		return response.ok(c, user);
	},

	/**
	 * GET /auths/verify-email
	 * Verify email with token
	 */
	async verifyEmail(c: Context) {
		const token = c.req.query('token');

		if (!token) {
			throw new ValidationError('Verification token is required', { token: ['Token is required'] });
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
			throw AuthError.unauthorized();
		}

		await authService.resendVerificationEmail(payload.auid);

		return response.success(c, 'Verification email sent successfully');
	},

	/**
	 * POST /auths/google
	 * Authenticate with Google OAuth
	 */
	async googleAuth(c: Context) {
		const body = await c.req.json();
		const result = await authService.googleAuth(body);

		const cookieConfig = authService.getCookieConfig();
		await setSignedCookie(c, cookieConfig.name, result.token, cookieConfig.secret, cookieConfig.options);

		return response.ok(c, result, 'Google authentication successful');
	},

	/**
	 * POST /auths/forgot-password
	 * Send password reset email
	 */
	async forgotPassword(c: Context) {
		const body = await c.req.json();
		const result = await authService.forgotPassword(body);

		return response.success(c, result.message);
	},

	/**
	 * POST /auths/reset-password
	 * Reset password with token
	 */
	async resetPassword(c: Context) {
		const body = await c.req.json();
		const result = await authService.resetPassword(body);

		return response.success(c, result.message);
	},

	/**
	 * PUT /auths/profile
	 * Update own profile (name, avatar_url)
	 */
	async updateProfile(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const body = await c.req.json();
		const result = await authService.updateProfile(payload.auid, body);

		return response.ok(c, result, 'Profile updated successfully');
	},

	/**
	 * PUT /auths/password
	 * Change own password
	 */
	async changePassword(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const body = await c.req.json();
		const result = await authService.changePassword(payload.auid, body);

		return response.success(c, result.message);
	},

	/**
	 * DELETE /auths/account
	 * Delete own account
	 */
	async deleteAccount(c: Context) {
		const payload = c.get('user') as { auid: string };
		if (!payload?.auid) throw AuthError.unauthorized();

		const result = await authService.deleteAccount(payload.auid);

		const cookieConfig = authService.getCookieConfig();
		deleteCookie(c, cookieConfig.name);

		return response.success(c, result.message);
	},

	/**
	 * GET /auths/signout
	 * Sign out user
	 */
	async signout(c: Context) {
		const cookieConfig = authService.getCookieConfig();
		deleteCookie(c, cookieConfig.name);

		return response.success(c, 'Logged out successfully');
	},
};
