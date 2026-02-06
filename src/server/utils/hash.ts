import bcrypt from 'bcrypt';

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
