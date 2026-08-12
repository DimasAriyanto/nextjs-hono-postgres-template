import { eq, isNull, and } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { RefreshTokensTable, type TSelectRefreshToken } from '@/server/databases/schemas/refresh-tokens.schema';

export class RefreshTokenRepository {
	/**
	 * Create a new refresh token record
	 */
	async create(userId: string, tokenHash: string, expiresAt: string): Promise<TSelectRefreshToken> {
		const [row] = await db
			.insert(RefreshTokensTable)
			.values({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt })
			.returning();

		return row;
	}

	/**
	 * Find a refresh token by its hash, regardless of revoked status (needed for reuse detection)
	 */
	async findByHash(hash: string): Promise<TSelectRefreshToken | undefined> {
		const [row] = await db.select().from(RefreshTokensTable).where(eq(RefreshTokensTable.token_hash, hash)).limit(1);

		return row;
	}

	/**
	 * Revoke a single refresh token by id
	 */
	async revoke(id: string): Promise<void> {
		await db
			.update(RefreshTokensTable)
			.set({ revoked_at: new Date().toISOString() })
			.where(and(eq(RefreshTokensTable.id, id), isNull(RefreshTokensTable.revoked_at)));
	}

	/**
	 * Revoke all active refresh tokens for a user (used on reuse detection / logout)
	 */
	async revokeAllForUser(userId: string): Promise<void> {
		await db
			.update(RefreshTokensTable)
			.set({ revoked_at: new Date().toISOString() })
			.where(and(eq(RefreshTokensTable.user_id, userId), isNull(RefreshTokensTable.revoked_at)));
	}
}

export const refreshTokenRepository = new RefreshTokenRepository();
