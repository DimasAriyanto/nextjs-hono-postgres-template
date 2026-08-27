import { loadEnvConfig } from '@next/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
// central
import { createDatabase } from '@/server/databases/client';

loadEnvConfig(process.cwd());

// migrate(db, { migrationsFolder: './src/server/databases/migrations' });

async function main() {
	const provider = process.env.DB_PROVIDER || 'local';
	const isManaged = provider === 'supabase' || provider === 'neon';

	console.info(`🔧 Running migrations for: ${provider}`);

	// Only create database for local development
	// Managed providers (Supabase, Neon) already have the database created
	if (!isManaged) {
		console.info('📦 Creating database if not exists...');
		await createDatabase({ database: process.env.DB_DATABASE as string });
	} else {
		console.info(`☁️  Using ${provider} - skipping database creation`);
	}

	// Build connection URL based on provider
	let dbUrl: string;

	if (provider === 'supabase') {
		dbUrl = process.env.SUPABASE_DB_URL || '';
		if (!dbUrl) {
			throw new Error('SUPABASE_DB_URL is required when DB_PROVIDER=supabase');
		}
	} else if (provider === 'neon') {
		dbUrl = process.env.NEON_DATABASE_URL || '';
		if (!dbUrl) {
			throw new Error('NEON_DATABASE_URL is required when DB_PROVIDER=neon');
		}
	} else {
		// Build URL from components for local database
		const { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env;

		if (!DB_HOST || !DB_PORT || !DB_DATABASE || !DB_USERNAME || !DB_PASSWORD) {
			throw new Error(
				'Missing required database environment variables. Please check: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD'
			);
		}

		dbUrl = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
	}

	const connectionConfig = isManaged ? { max: 1, prepare: false } : { max: 1 };

	const pool = postgres(dbUrl, connectionConfig);

	const db = drizzle(pool);

	console.info('🚀 Running migrations...');
	await migrate(db, {
		migrationsFolder: './src/server/databases/migrations',
	});
	await pool.end();

	console.info('✅ Migrations complete!');
	process.exit(); // default success
}

main().catch((e) => {
	console.error('❌ Migration failed:', e);
	process.exit(1); // 1 indicates error
});
