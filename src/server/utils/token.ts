import crypto from 'crypto';

/**
 * Generate a random token for email verification
 */
export const generateVerificationToken = (): string => {
	return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate token expiration date (default: 24 hours)
 */
export const generateTokenExpiration = (hours: number = 24): Date => {
	const expiration = new Date();
	expiration.setHours(expiration.getHours() + hours);
	return expiration;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expirationDate: string | Date): boolean => {
	const expiration = new Date(expirationDate);
	return new Date() > expiration;
};

/**
 * Generate a short numeric OTP code
 */
export const generateOTP = (length: number = 6): string => {
	const digits = '0123456789';
	let otp = '';
	for (let i = 0; i < length; i++) {
		otp += digits[Math.floor(Math.random() * digits.length)];
	}
	return otp;
};
