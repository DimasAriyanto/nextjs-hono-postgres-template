import { sign } from 'hono/jwt';
import dayjs from 'dayjs';
import { AuthError, NotFoundError, ConflictError, InternalError } from '@/server/errors';
import { userRepository, roleRepository, permissionRepository, refreshTokenRepository } from '@/server/repositories';
import { emailService } from './email.service';
import { generateVerificationToken, generateTokenExpiration, isTokenExpired, hashPassword, comparePassword, hashRefreshToken } from '@/server/utils';
import type { TInsertUser, TSelectUser } from '@/server/databases/schemas/users.schema';
import { MENU_PERMISSIONS } from '@/constants/permissions';

const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL) || 60 * 15; // default: 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL) || 60 * 60 * 24 * 30; // default: 30 days

async function resolvePermissions(userId: string, isAdmin: boolean): Promise<string[]> {
	return isAdmin ? MENU_PERMISSIONS.map((p) => p.key) : permissionRepository.findKeysForUser(userId);
}

export class AuthService {
	/**
	 * Build a signed access token and a rotating DB-backed refresh token for a user
	 */
	private async issueTokens(user: TSelectUser, isAdmin: boolean, permissions: string[]) {
		const payload = {
			exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
			iat: dayjs().unix(), // issued at
			auid: user.id,
			aurl: isAdmin ? 'admin' : 'user',
			aper: isAdmin || permissions.length > 0,
			uenv: 'central',
		};

		const token = await sign(payload, process.env.APP_KEY as string);

		const refreshToken = generateVerificationToken();
		const refreshExpiresAt = generateTokenExpiration(REFRESH_TOKEN_TTL_SECONDS / 3600);
		await refreshTokenRepository.create(user.id, hashRefreshToken(refreshToken), refreshExpiresAt.toISOString());

		return { token, refreshToken };
	}

	/**
	 * Sign in user with email and password
	 */
	async login(data: { email: string; password: string }) {
		const user = await userRepository.findByEmail(data.email);

		if (!user) {
			throw AuthError.invalidCredentials();
		}

		// OAuth-only users have no password
		if (!user.password) {
			throw AuthError.invalidCredentials();
		}

		const matchPassword = await comparePassword(data.password, user.password);

		if (!matchPassword) {
			throw AuthError.invalidCredentials();
		}

		// Resolve user roles to determine admin status
		const userWithRoles = await userRepository.findByIdWithRoles(user.id);
		const isAdmin = userWithRoles?.roles.some((r) => r.role.is_admin) ?? false;
		const permissions = await resolvePermissions(user.id, isAdmin);

		const { token, refreshToken } = await this.issueTokens(user, isAdmin, permissions);

		return {
			user: this.sanitizeUser(user),
			token,
			refreshToken,
			permissions,
			email_verified: user.email_verified_at !== null,
			is_admin: isAdmin,
		};
	}

	/**
	 * Register new user
	 */
	async register(data: { email: string; password: string; name?: string }) {
		// Check if email already exists
		const existingUser = await userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new ConflictError('Email already registered');
		}

		// Generate verification token
		const verificationToken = generateVerificationToken();
		const tokenExpiration = generateTokenExpiration(24); // 24 hours

		// Hash password
		const hashedPassword = await hashPassword(data.password);

		const userData: TInsertUser = {
			email: data.email,
			password: hashedPassword,
			name: data.name,
			verification_token: verificationToken,
			verification_token_expires_at: tokenExpiration.toISOString(),
		};

		const user = await userRepository.create(userData);

		// Assign default role to user
		const defaultRole = await roleRepository.findDefault();
		if (defaultRole) {
			await userRepository.assignRole(user.id, defaultRole.id);
		}
		const isAdmin = defaultRole?.is_admin ?? false;

		// Send verification email (non-blocking)
		emailService.sendVerificationEmail({
			to: user.email,
			token: verificationToken,
			userName: user.name || undefined,
		}).catch((err) => {
			console.error('Failed to send verification email:', err);
		});

		const permissions = await resolvePermissions(user.id, isAdmin);

		// Generate tokens for auto-login after register
		const { token, refreshToken } = await this.issueTokens(user, isAdmin, permissions);

		return {
			user: this.sanitizeUser(user),
			token,
			refreshToken,
			permissions,
			email_verified: false,
			is_admin: isAdmin,
			message: 'Please check your email to verify your account',
		};
	}

	/**
	 * Verify email with token
	 */
	async verifyEmail(token: string) {
		const user = await userRepository.findByVerificationToken(token);

		if (!user) {
			throw AuthError.tokenInvalid();
		}

		// Check if token is expired
		if (user.verification_token_expires_at && isTokenExpired(user.verification_token_expires_at)) {
			throw AuthError.tokenExpired();
		}

		// Check if already verified
		if (user.email_verified_at) {
			throw AuthError.emailAlreadyVerified();
		}

		// Mark email as verified
		await userRepository.markEmailAsVerified(user.id);

		return {
			message: 'Email verified successfully',
			user: this.sanitizeUser(user),
		};
	}

	/**
	 * Resend verification email
	 */
	async resendVerificationEmail(userId: string) {
		const user = await userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError('User');
		}

		if (user.email_verified_at) {
			throw AuthError.emailAlreadyVerified();
		}

		// Generate new verification token
		const verificationToken = generateVerificationToken();
		const tokenExpiration = generateTokenExpiration(24); // 24 hours

		// Update token in database
		await userRepository.updateVerificationToken(
			user.id,
			verificationToken,
			tokenExpiration.toISOString()
		);

		// Send verification email
		const sent = await emailService.sendVerificationEmail({
			to: user.email,
			token: verificationToken,
			userName: user.name || undefined,
		});

		if (!sent) {
			throw new InternalError('Failed to send verification email');
		}

		return {
			message: 'Verification email sent successfully',
		};
	}

	/**
	 * Get user profile by ID
	 */
	async getProfile(userId: string) {
		const user = await userRepository.findByIdWithRoles(userId);

		if (!user) {
			throw new NotFoundError('User');
		}

		const isAdmin = user.roles.some((r) => r.role.is_admin);

		return {
			...this.sanitizeUser(user),
			roles: user.roles.map((r) => r.role),
			permissions: await resolvePermissions(userId, isAdmin),
			email_verified: user.email_verified_at !== null,
		};
	}

	/**
	 * Update own profile (name, avatar_url)
	 */
	async updateProfile(userId: string, data: { name?: string; avatar_url?: string }) {
		const user = await userRepository.findById(userId);
		if (!user) throw new NotFoundError('User');

		const updated = await userRepository.update(userId, {
			name: data.name,
			avatar_url: data.avatar_url,
		});

		return {
			...this.sanitizeUser(updated!),
			email_verified: updated!.email_verified_at !== null,
		};
	}

	/**
	 * Change own password
	 */
	async changePassword(userId: string, data: { current_password: string; new_password: string }) {
		const user = await userRepository.findById(userId);
		if (!user) throw new NotFoundError('User');

		if (!user.password) {
			throw AuthError.invalidCredentials();
		}

		const match = await comparePassword(data.current_password, user.password);
		if (!match) throw AuthError.invalidCredentials();

		const hashed = await hashPassword(data.new_password);
		await userRepository.update(userId, { password: hashed });

		return { message: 'Password changed successfully' };
	}

	/**
	 * Delete own account
	 */
	async deleteAccount(userId: string) {
		const user = await userRepository.findById(userId);
		if (!user) throw new NotFoundError('User');

		await userRepository.delete(userId);

		return { message: 'Account deleted successfully' };
	}

	/**
	 * Parse Google JWT token on the server side (uses Buffer, not atob)
	 */
	private parseGoogleToken(token: string): { sub: string; email: string; name: string; picture?: string } {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const json = Buffer.from(base64, 'base64').toString('utf-8');
			return JSON.parse(json);
		} catch {
			throw AuthError.tokenInvalid();
		}
	}

	/**
	 * Authenticate with Google OAuth
	 */
	async googleAuth(data: { token: string }) {
		const googleUser = this.parseGoogleToken(data.token);

		if (!googleUser.email || !googleUser.sub) {
			throw AuthError.tokenInvalid();
		}

		const { user, isNewUser } = await userRepository.upsertOAuthUser({
			provider: 'google',
			provider_id: googleUser.sub,
			email: googleUser.email,
			name: googleUser.name || googleUser.email.split('@')[0],
			avatar_url: googleUser.picture,
		});

		// Assign default role for new users
		if (isNewUser) {
			const defaultRole = await roleRepository.findDefault();
			if (defaultRole) {
				await userRepository.assignRole(user.id, defaultRole.id);
			}
		}

		const userWithRoles = await userRepository.findByIdWithRoles(user.id);
		const isAdmin = userWithRoles?.roles.some((r) => r.role.is_admin) ?? false;
		const permissions = await resolvePermissions(user.id, isAdmin);

		const { token, refreshToken } = await this.issueTokens(user, isAdmin, permissions);

		return {
			user: this.sanitizeUser(user),
			token,
			refreshToken,
			permissions,
			email_verified: user.email_verified_at !== null,
			is_admin: isAdmin,
		};
	}

	/**
	 * Refresh an access token using a valid refresh token, rotating it in the process
	 */
	async refresh(rawRefreshToken: string) {
		const hash = hashRefreshToken(rawRefreshToken);
		const row = await refreshTokenRepository.findByHash(hash);

		if (!row) {
			throw AuthError.tokenInvalid();
		}

		if (row.revoked_at) {
			// Reuse of an already-rotated/revoked token — treat as compromised
			await refreshTokenRepository.revokeAllForUser(row.user_id);
			throw AuthError.tokenInvalid();
		}

		if (isTokenExpired(row.expires_at)) {
			throw AuthError.tokenExpired();
		}

		await refreshTokenRepository.revoke(row.id);

		const user = await userRepository.findByIdWithRoles(row.user_id);
		if (!user) {
			throw new NotFoundError('User');
		}

		const isAdmin = user.roles.some((r) => r.role.is_admin);
		const permissions = await resolvePermissions(user.id, isAdmin);

		const { token, refreshToken } = await this.issueTokens(user, isAdmin, permissions);

		return {
			user: this.sanitizeUser(user),
			token,
			refreshToken,
			permissions,
			email_verified: user.email_verified_at !== null,
			is_admin: isAdmin,
		};
	}

	/**
	 * Revoke a refresh token (used on sign out)
	 */
	async revokeRefreshToken(rawRefreshToken: string) {
		const hash = hashRefreshToken(rawRefreshToken);
		const row = await refreshTokenRepository.findByHash(hash);

		if (row && !row.revoked_at) {
			await refreshTokenRepository.revoke(row.id);
		}
	}

	/**
	 * Send password reset email (forgot password)
	 */
	async forgotPassword(data: { email: string }) {
		const user = await userRepository.findByEmail(data.email);

		// Return generic message regardless of whether user exists (security)
		if (!user) {
			return { message: 'If that email is registered, a reset link has been sent.' };
		}

		const token = generateVerificationToken();
		const expiresAt = generateTokenExpiration(1); // 1 hour

		await userRepository.updateForgotPasswordToken(user.id, token, expiresAt.toISOString());

		emailService.sendPasswordResetEmail({
			to: user.email,
			token,
			userName: user.name || undefined,
		}).catch((err) => {
			console.error('Failed to send password reset email:', err);
		});

		return { message: 'If that email is registered, a reset link has been sent.' };
	}

	/**
	 * Reset password with token
	 */
	async resetPassword(data: { token: string; password: string }) {
		const user = await userRepository.findByForgotPasswordToken(data.token);

		if (!user) {
			throw AuthError.tokenInvalid();
		}

		if (!user.token_forgot_password_expires_at || isTokenExpired(user.token_forgot_password_expires_at)) {
			throw AuthError.tokenExpired();
		}

		const hashedPassword = await hashPassword(data.password);

		await userRepository.update(user.id, { password: hashedPassword });
		await userRepository.updateForgotPasswordToken(user.id, null, null);

		// Force re-login everywhere — a password reset likely means the old password was compromised
		await refreshTokenRepository.revokeAllForUser(user.id);

		return { message: 'Password has been reset successfully' };
	}

	/**
	 * Get access token cookie configuration
	 */
	getCookieConfig() {
		return {
			name: '__x',
			secret: process.env.APP_COOKIE_KEY as string,
			options: {
				path: '/',
				secure: true,
				httpOnly: true,
				maxAge: ACCESS_TOKEN_TTL_SECONDS,
				sameSite: 'Strict' as const,
			},
		};
	}

	/**
	 * Get refresh token cookie configuration.
	 * Path must stay '/' (not scoped to the auth API) so it's present on ordinary page navigations too.
	 */
	getRefreshCookieConfig() {
		return {
			name: '__rx',
			secret: process.env.APP_COOKIE_KEY as string,
			options: {
				path: '/',
				secure: true,
				httpOnly: true,
				maxAge: REFRESH_TOKEN_TTL_SECONDS,
				sameSite: 'Strict' as const,
			},
		};
	}

	/**
	 * Remove sensitive data from user object
	 */
	private sanitizeUser(user: { id: string; email: string; created_at: string; updated_at: string;[key: string]: unknown }) {
		return {
			id: user.id,
			email: user.email,
			name: user.name as string | null | undefined,
			avatar_url: user.avatar_url as string | null | undefined,
			created_at: user.created_at,
			updated_at: user.updated_at,
		};
	}
}

export const authService = new AuthService();
