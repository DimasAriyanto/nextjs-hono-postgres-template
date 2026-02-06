import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

loadEnvConfig(process.cwd());

/**
 * Get database URL based on provider
 */
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

export default defineConfig({
	schema: './src/server/databases/schemas',
	out: './src/server/databases/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: getDatabaseUrl(),
	},
	verbose: true,
	strict: true,
});
