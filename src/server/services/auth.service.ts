import { sign } from 'hono/jwt';
import dayjs from 'dayjs';
import { AuthError, NotFoundError, ConflictError, InternalError } from '@/server/errors';
import { userRepository } from '@/server/repositories';
import { emailService } from './email.service';
import { generateVerificationToken, generateTokenExpiration, isTokenExpired, hashPassword, comparePassword } from '@/server/utils';
import type { TInsertUser } from '@/server/databases/schemas/users';

export class AuthService {
	/**
	 * Sign in user with email and password
	 */
	async login(data: { email: string; password: string }) {
		const user = await userRepository.findByEmail(data.email);

		if (!user) {
			throw AuthError.invalidCredentials();
		}

		const matchPassword = await comparePassword(data.password, user.password);

		if (!matchPassword) {
			throw AuthError.invalidCredentials();
		}

		const payload = {
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expired in 24 hours
			iat: dayjs().unix(), // issued at
			auid: user.id,
			aurl: 'admin',
			uenv: 'central',
		};

		const token = await sign(payload, process.env.APP_KEY as string);

		return {
			user: this.sanitizeUser(user),
			token,
			permissions: null,
			email_verified: user.email_verified_at !== null,
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

		// Send verification email (non-blocking)
		emailService.sendVerificationEmail({
			to: user.email,
			token: verificationToken,
			userName: user.name || undefined,
		}).catch((err) => {
			console.error('Failed to send verification email:', err);
		});

		// Generate token for auto-login after register
		const payload = {
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expired in 24 hours
			iat: dayjs().unix(), // issued at
			auid: user.id,
			aurl: 'admin',
			uenv: 'central',
		};

		const token = await sign(payload, process.env.APP_KEY as string);

		return {
			user: this.sanitizeUser(user),
			token,
			permissions: null,
			email_verified: false,
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

		return {
			...this.sanitizeUser(user),
			roles: user.roles.map((r) => r.role),
			email_verified: user.email_verified_at !== null,
		};
	}

	/**
	 * Get cookie configuration
	 */
	getCookieConfig() {
		return {
			name: '__x',
			secret: process.env.APP_COOKIE_KEY as string,
			options: {
				path: '/',
				secure: true,
				httpOnly: true,
				maxAge: 60 * 60 * 24, // 1 day in seconds
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
			created_at: user.created_at,
			updated_at: user.updated_at,
		};
	}
}

export const authService = new AuthService();
