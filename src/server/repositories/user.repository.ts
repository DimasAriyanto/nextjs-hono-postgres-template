import { eq, and, ilike, or } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { UsersTable, RoleUserTable, type TSelectUser, type TInsertUser } from '@/server/databases/schemas/users.schema';

interface OAuthUserData {
	provider: string;
	provider_id: string;
	email: string;
	name: string;
	avatar_url?: string;
}

export class UserRepository {
	/**
	 * Find all users with pagination and search
	 */
	async findAll(options?: { page?: number; limit?: number; search?: string }) {
		const { page = 1, limit = 10, search } = options || {};

		const results = await db.query.UsersTable.findMany({
			where: search
				? or(ilike(UsersTable.email, `%${search}%`), ilike(UsersTable.name, `%${search}%`))
				: undefined,
			with: {
				roles: {
					with: {
						role: true,
					},
				},
			},
			limit,
			offset: (page - 1) * limit,
		});

		return results;
	}

	/**
	 * Find user by ID
	 */
	async findById(id: string): Promise<TSelectUser | undefined> {
		const [user] = await db.select().from(UsersTable).where(eq(UsersTable.id, id)).limit(1);

		return user;
	}

	/**
	 * Find user by email
	 */
	async findByEmail(email: string): Promise<TSelectUser | undefined> {
		const [user] = await db.select().from(UsersTable).where(eq(UsersTable.email, email)).limit(1);

		return user;
	}

	/**
	 * Find user with roles
	 */
	async findByIdWithRoles(id: string) {
		const user = await db.query.UsersTable.findFirst({
			where: eq(UsersTable.id, id),
			with: {
				roles: {
					with: {
						role: true,
					},
				},
			},
		});

		return user;
	}

	/**
	 * Create new user
	 */
	async create(data: TInsertUser): Promise<TSelectUser> {
		const [user] = await db.insert(UsersTable).values(data).returning();

		return user;
	}

	/**
	 * Update user by ID
	 */
	async update(id: string, data: Partial<TInsertUser>): Promise<TSelectUser | undefined> {
		const [user] = await db
			.update(UsersTable)
			.set({ ...data, updated_at: new Date().toISOString() })
			.where(eq(UsersTable.id, id))
			.returning();

		return user;
	}

	/**
	 * Delete user by ID
	 */
	async delete(id: string): Promise<boolean> {
		const result = await db.delete(UsersTable).where(eq(UsersTable.id, id)).returning({ id: UsersTable.id });

		return result.length > 0;
	}

	/**
	 * Assign role to user
	 */
	async assignRole(userId: string, roleId: string): Promise<void> {
		await db.insert(RoleUserTable).values({ user_id: userId, role_id: roleId }).onConflictDoNothing();
	}

	/**
	 * Remove role from user
	 */
	async removeRole(userId: string, roleId: string): Promise<void> {
		await db.delete(RoleUserTable).where(and(eq(RoleUserTable.user_id, userId), eq(RoleUserTable.role_id, roleId)));
	}

	/**
	 * Get user roles
	 */
	async getUserRoles(userId: string) {
		const roles = await db
			.select()
			.from(RoleUserTable)
			.where(eq(RoleUserTable.user_id, userId));

		return roles;
	}

	/**
	 * Count total users
	 */
	async count(search?: string): Promise<number> {
		let query = db.select().from(UsersTable).$dynamic();

		if (search) {
			query = query.where(or(ilike(UsersTable.email, `%${search}%`), ilike(UsersTable.name, `%${search}%`)));
		}

		const result = await query;
		return result.length;
	}

	/**
	 * Find user by verification token
	 */
	async findByVerificationToken(token: string): Promise<TSelectUser | undefined> {
		const [user] = await db
			.select()
			.from(UsersTable)
			.where(eq(UsersTable.verification_token, token))
			.limit(1);

		return user;
	}

	/**
	 * Update verification token
	 */
	async updateVerificationToken(
		userId: string,
		token: string | null,
		expiresAt: string | null
	): Promise<TSelectUser | undefined> {
		const [user] = await db
			.update(UsersTable)
			.set({
				verification_token: token,
				verification_token_expires_at: expiresAt,
				updated_at: new Date().toISOString(),
			})
			.where(eq(UsersTable.id, userId))
			.returning();

		return user;
	}

	/**
	 * Mark email as verified
	 */
	async markEmailAsVerified(userId: string): Promise<TSelectUser | undefined> {
		const [user] = await db
			.update(UsersTable)
			.set({
				email_verified_at: new Date().toISOString(),
				verification_token: null,
				verification_token_expires_at: null,
				updated_at: new Date().toISOString(),
			})
			.where(eq(UsersTable.id, userId))
			.returning();

		return user;
	}

	/**
	 * Check if user email is verified
	 */
	async isEmailVerified(userId: string): Promise<boolean> {
		const user = await this.findById(userId);
		return user?.email_verified_at !== null;
	}

	/**
	 * Upsert OAuth user — create if not exists, update provider info if email already registered
	 */
	async upsertOAuthUser(data: OAuthUserData): Promise<{ user: TSelectUser; isNewUser: boolean }> {
		// Check by provider_id first (returning user via same OAuth provider)
		const [byProvider] = await db
			.select()
			.from(UsersTable)
			.where(and(eq(UsersTable.provider, data.provider), eq(UsersTable.provider_id, data.provider_id)))
			.limit(1);

		if (byProvider) {
			// Update avatar/name in case they changed in Google
			const [updated] = await db
				.update(UsersTable)
				.set({ name: data.name, avatar_url: data.avatar_url ?? null, updated_at: new Date().toISOString() })
				.where(eq(UsersTable.id, byProvider.id))
				.returning();
			return { user: updated, isNewUser: false };
		}

		// Check by email (user registered via email/password before)
		const [byEmail] = await db
			.select()
			.from(UsersTable)
			.where(eq(UsersTable.email, data.email))
			.limit(1);

		if (byEmail) {
			// Link OAuth provider to existing account
			const [updated] = await db
				.update(UsersTable)
				.set({
					provider: data.provider,
					provider_id: data.provider_id,
					avatar_url: data.avatar_url ?? null,
					email_verified_at: byEmail.email_verified_at ?? new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.where(eq(UsersTable.id, byEmail.id))
				.returning();
			return { user: updated, isNewUser: false };
		}

		// New user — create account (no password for OAuth)
		const [created] = await db
			.insert(UsersTable)
			.values({
				email: data.email,
				name: data.name,
				avatar_url: data.avatar_url ?? null,
				provider: data.provider,
				provider_id: data.provider_id,
				email_verified_at: new Date().toISOString(), // OAuth email is pre-verified
			})
			.returning();

		return { user: created, isNewUser: true };
	}

	/**
	 * Find user by forgot password token
	 */
	async findByForgotPasswordToken(token: string): Promise<TSelectUser | undefined> {
		const [user] = await db
			.select()
			.from(UsersTable)
			.where(eq(UsersTable.token_forgot_password, token))
			.limit(1);

		return user;
	}

	/**
	 * Update forgot password token
	 */
	async updateForgotPasswordToken(
		userId: string,
		token: string | null,
		expiresAt: string | null
	): Promise<TSelectUser | undefined> {
		const [user] = await db
			.update(UsersTable)
			.set({
				token_forgot_password: token,
				token_forgot_password_expires_at: expiresAt,
				updated_at: new Date().toISOString(),
			})
			.where(eq(UsersTable.id, userId))
			.returning();

		return user;
	}
}

export const userRepository = new UserRepository();
