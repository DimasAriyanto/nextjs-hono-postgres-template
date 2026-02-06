/* eslint-disable @typescript-eslint/no-explicit-any */
// import { HTTPException } from 'hono/http-exception';
import { sql, SQL } from 'drizzle-orm';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { PgSelect } from 'drizzle-orm/pg-core';
// import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schemas from './schemas';

/**
 * Get database connection URL based on provider
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
	// This avoids issues with variable interpolation in .env files
	const { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env;

	if (!DB_HOST || !DB_PORT || !DB_DATABASE || !DB_USERNAME || !DB_PASSWORD) {
		throw new Error(
			'Missing required database environment variables. Please check: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD'
		);
	}

	return `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
};

/**
 * Get connection configuration based on provider
 */
const getConnectionConfig = () => {
	const provider = process.env.DB_PROVIDER || 'local';

	if (provider === 'supabase') {
		// Supabase-specific configuration
		return {
			prepare: false, // Required for transaction pooler (port 6543)
			idle_timeout: 20,
			max_lifetime: 60 * 30, // 30 minutes
		};
	}

	// Local PostgreSQL configuration
	return {
		idle_timeout: 20000,
	};
};

/**
 * Lazy initialization for database connection
 * This ensures environment variables are loaded before creating the pool
 */
let _pool: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schemas>> | null = null;

const getPool = () => {
	if (!_pool) {
		_pool = postgres(getDatabaseUrl(), getConnectionConfig());
	}
	return _pool;
};

const getDb = () => {
	if (!_db) {
		_db = drizzle(getPool(), { schema: schemas });
	}
	return _db;
};

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schemas>>, {
	get(target, prop) {
		return Reflect.get(getDb(), prop);
	},
}) as ReturnType<typeof drizzle<typeof schemas>>;

export const poolEnd = () => {
	if (_pool) {
		return _pool.end();
	}
};

/**
 * Check if we're using Supabase
 */
export const isSupabase = () => process.env.DB_PROVIDER === 'supabase';

export const withPagination = async <T extends PgSelect>(query: T, orderBy: SQL, page: number = 1, limit: number = 10) => {
	const subQuery = query.as('subQuery');

	const [results, total] = await Promise.all([
		query
			.limit(limit)
			.offset((page - 1) * limit)
			.orderBy(orderBy),
		db
			.select({ total: sql<number>`count(*)` })
			.from(subQuery as any)
			.then((res: any) => Number(res[0].total)),
	]);

	const pages = Math.ceil(total / limit); // total page

	// add incrementing number (no)
	// const startNo = (page - 1) * limit + 1; // start from last data
	const startNo = total - (page - 1) * limit; // start from first data
	const resultsWithNo = results.map((item, index) => ({
		no: startNo - index,
		...item,
	})) as typeof results & { no: number }[];

	return {
		results: resultsWithNo,
		meta: { page, pages, limit, total },
	};
};

/**
 * ===============
 * CREATE DATABASE
 * ===============
 */
export async function createDatabase({ database }: { database: string }) {
	// Connect to default 'postgres' database to create new database
	const pool = postgres({
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT) || 5432,
		username: process.env.DB_USERNAME || '',
		password: process.env.DB_PASSWORD || '',
		database: 'postgres', // Connect to default postgres database
	});

	try {
		// check if db exists first (optional)
		const dbExists = await pool`SELECT 1 FROM pg_database WHERE datname = ${database}`;

		if (dbExists.length === 0) {
			await pool.unsafe(`CREATE DATABASE "${database}"`);
			console.log(`✅ Database ${database} created successfully.`);
		} else {
			console.log(`ℹ️  Database ${database} already exists.`);
		}
	} finally {
		await pool.end();
	}
}
