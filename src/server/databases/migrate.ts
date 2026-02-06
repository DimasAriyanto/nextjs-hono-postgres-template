import { loadEnvConfig } from '@next/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
// central
import { createDatabase, isSupabase } from '@/server/databases/client';

loadEnvConfig(process.cwd());

// migrate(db, { migrationsFolder: './src/server/databases/migrations' });

async function main() {
	const provider = process.env.DB_PROVIDER || 'local';

	console.info(`🔧 Running migrations for: ${provider}`);

	// Only create database for local development
	// Supabase database already exists
	if (!isSupabase()) {
		console.info('📦 Creating database if not exists...');
		await createDatabase({ database: process.env.DB_DATABASE as string });
	} else {
		console.info('☁️  Using Supabase - skipping database creation');
	}

	// Build connection URL based on provider
	let dbUrl: string;

	if (isSupabase()) {
		dbUrl = process.env.SUPABASE_DB_URL || '';
		if (!dbUrl) {
			throw new Error('SUPABASE_DB_URL is required when DB_PROVIDER=supabase');
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

	const connectionConfig = isSupabase() ? { max: 1, prepare: false } : { max: 1 };

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
