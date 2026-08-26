import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Hash a plain text password synchronously (useful for seeds)
 */
export const hashPasswordSync = (password: string): string => {
    return bcrypt.hashSync(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Hash a high-entropy opaque token (refresh token, email verification token,
 * password reset token) for storage. Uses sha256 instead of bcrypt since the input
 * is already random, not a low-entropy secret — so a DB leak alone (backup exposure,
 * read-only SQLi, insider access) can't be used to log in, verify an email, or reset
 * a password; the raw token only ever exists in the cookie/email link sent to the user.
 */
export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
