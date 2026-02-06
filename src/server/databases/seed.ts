import { loadEnvConfig } from '@next/env';
import * as schema from './schemas';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { hashPasswordSync } from '@/server/utils';

loadEnvConfig(process.cwd());

// Build database URL from components
const getDatabaseUrl = (): string => {
	const provider = process.env.DB_PROVIDER || 'local';

	if (provider === 'supabase') {
		const url = process.env.SUPABASE_DB_URL;
		if (!url) {
			throw new Error('SUPABASE_DB_URL is required when DB_PROVIDER=supabase');
		}
		return url;
	}

	// Build local database URL from components
	const { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env;

	if (!DB_HOST || !DB_PORT || !DB_DATABASE || !DB_USERNAME || !DB_PASSWORD) {
		throw new Error(
			'Missing required database environment variables. Please check: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD'
		);
	}

	return `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
};

const pool = postgres(getDatabaseUrl(), { max: 1 });

const db = drizzle(pool);

export async function seed() {
	console.log('Start seeding..');

	const roles = await db
		.insert(schema.RolesTable)
		.values([{ name: 'admin' }, { name: 'customer', is_default: true }])
		.onConflictDoNothing()
		.returning();

	console.log('roles: ', roles);

	await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(schema.UsersTable)
			.values({
				email: 'admin@gmail.com',
				password: hashPasswordSync('password'),
			})
			.onConflictDoNothing()
			.returning();

		const [role] = await tx.select().from(schema.RolesTable).where(eq(schema.RolesTable.name, 'admin')).limit(1);

		await tx
			.insert(schema.RoleUserTable)
			.values({
				role_id: role.id,
				user_id: user.id,
			})
			.onConflictDoNothing();

		console.log('user: ', user);
	});

	console.log('Seeding complete!');
	process.exit(0);
}

seed();
