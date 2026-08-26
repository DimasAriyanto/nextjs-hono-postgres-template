import { loadEnvConfig } from '@next/env';
import * as schema from './schemas';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { hashPasswordSync } from '@/server/utils';
import { MENU_PERMISSIONS } from '@/constants/permissions';
import { SETTING_KEYS, SETTING_KEY_GROUP_MAP } from '@/contracts/setting';
import { slugify } from '@/libs/string';
import {
	faqsEn,
	faqsId,
	aboutContentHtmlEn,
	aboutContentHtmlId,
	termsOfServiceHtmlEn,
	termsOfServiceHtmlId,
	privacyPolicyHtmlEn,
	privacyPolicyHtmlId,
	bannersEn,
	bannersId,
	articleCategoriesSeed,
	articlesSeed,
} from './mock-data';

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
		.values([
			{ name: 'admin', is_admin: true },
			{ name: 'customer', is_default: true },
		])
		.onConflictDoNothing()
		.returning();

	console.log('roles: ', roles);

	const permissions = await db
		.insert(schema.PermissionsTable)
		.values(MENU_PERMISSIONS.map((p) => ({ name: p.key })))
		.onConflictDoNothing()
		.returning();

	console.log('permissions: ', permissions);

	await db.transaction(async (tx) => {
		const [insertedUser] = await tx
			.insert(schema.UsersTable)
			.values({
				email: 'admin@gmail.com',
				password: hashPasswordSync('password'),
			})
			.onConflictDoNothing()
			.returning();

		const user = insertedUser ?? (await tx.select().from(schema.UsersTable).where(eq(schema.UsersTable.email, 'admin@gmail.com')).limit(1))[0];

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

	// Translatable keys get one row per content locale so switching the site language
	// actually shows different content (see AppSettingsTable.locale / TRANSLATABLE_SETTING_KEYS).
	const settingsSeed: { key: string; locale: 'id' | 'en'; value: unknown }[] = [
		{ key: SETTING_KEYS.FAQS, locale: 'en', value: faqsEn },
		{ key: SETTING_KEYS.FAQS, locale: 'id', value: faqsId },
		{ key: SETTING_KEYS.ABOUT_CONTENT, locale: 'en', value: aboutContentHtmlEn },
		{ key: SETTING_KEYS.ABOUT_CONTENT, locale: 'id', value: aboutContentHtmlId },
		{ key: SETTING_KEYS.TERMS_OF_SERVICE, locale: 'en', value: termsOfServiceHtmlEn },
		{ key: SETTING_KEYS.TERMS_OF_SERVICE, locale: 'id', value: termsOfServiceHtmlId },
		{ key: SETTING_KEYS.PRIVACY_POLICY, locale: 'en', value: privacyPolicyHtmlEn },
		{ key: SETTING_KEYS.PRIVACY_POLICY, locale: 'id', value: privacyPolicyHtmlId },
		{ key: SETTING_KEYS.BANNERS, locale: 'en', value: bannersEn },
		{ key: SETTING_KEYS.BANNERS, locale: 'id', value: bannersId },
	];

	const insertedSettings = await db
		.insert(schema.AppSettingsTable)
		.values(settingsSeed.map((s) => ({
			key: s.key,
			locale: s.locale,
			group: SETTING_KEY_GROUP_MAP[s.key as keyof typeof SETTING_KEY_GROUP_MAP],
			value: s.value,
		})))
		.onConflictDoNothing()
		.returning();

	console.log('settings: ', insertedSettings);

	await db
		.insert(schema.ArticleCategoriesTable)
		.values(articleCategoriesSeed.map((c) => ({ name: c.name, slug: slugify(c.name) })))
		.onConflictDoNothing()
		.returning();

	const categories = await db.select().from(schema.ArticleCategoriesTable);
	const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

	console.log('article categories: ', categories);

	const [adminUser] = await db.select().from(schema.UsersTable).where(eq(schema.UsersTable.email, 'admin@gmail.com')).limit(1);

	if (adminUser) {
		const insertedArticles = await db
			.insert(schema.ArticlesTable)
			.values(
				articlesSeed.map((article) => ({
					title: article.title,
					slug: slugify(article.title),
					excerpt: article.excerpt,
					content: article.content,
					thumbnail_url: article.thumbnail_url,
					status: article.status,
					published_at: new Date().toISOString(),
					author_id: adminUser.id,
					category_id: categoryIdByName.get(article.category) ?? null,
					tags: article.tags,
				})),
			)
			.onConflictDoNothing()
			.returning();

		console.log('articles: ', insertedArticles);
	}

	console.log('Seeding complete!');
	process.exit(0);
}

seed();
