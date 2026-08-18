import { loadEnvConfig } from '@next/env';
import * as schema from './schemas';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { hashPasswordSync } from '@/server/utils';
import { MENU_PERMISSIONS } from '@/constants/permissions';
import { SETTING_KEYS, SETTING_KEY_GROUP_MAP, type TBannerItem, type TFaqItem } from '@/contracts/setting';
import { slugify } from '@/libs/string';

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

	const faqs: TFaqItem[] = [
		{
			question: 'What is this template built with?',
			answer:
				'Next.js (App Router) for the frontend, Hono as the API layer, Drizzle ORM for type-safe database access, and PostgreSQL as the database.',
		},
		{
			question: 'How do I run the project locally?',
			answer:
				'Copy .env.example to .env, set your database credentials, then run the dev server. The database and its schema are created automatically the first time you run migrations.',
		},
		{
			question: 'Does it include authentication out of the box?',
			answer:
				'Yes. Email/password login, role-based permissions, and secure refresh token rotation are already wired up so you can start building features right away.',
		},
		{
			question: 'Can I switch between a local PostgreSQL database and Supabase?',
			answer:
				'Yes. Set DB_PROVIDER to "local" or "supabase" in your environment variables — the connection layer picks the right configuration automatically.',
		},
		{
			question: 'What UI components are included?',
			answer:
				'A set of accessible, themeable components (tables, forms, modals, rich text editor, and more) built with Tailwind CSS, ready to use in the admin panel or your public pages.',
		},
		{
			question: 'Is this template free to use and modify?',
			answer: 'Yes, it is intended as a starting point for your own projects — use it, extend it, and adapt it to your needs.',
		},
	];

	const termsOfServiceHtml = `
<h2>1. Acceptance of Terms</h2>
<p>By accessing or using this application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the application.</p>
<h2>2. Use of the Application</h2>
<p>You agree to use this application only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of it.</p>
<h2>3. Accounts</h2>
<p>When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding your password and for any activity under your account.</p>
<h2>4. Intellectual Property</h2>
<p>All content, features, and functionality of this application are owned by us and are protected by applicable intellectual property laws.</p>
<h2>5. Limitation of Liability</h2>
<p>We are not liable for any indirect, incidental, or consequential damages arising from your use of the application.</p>
<h2>6. Changes to These Terms</h2>
<p>We may update these Terms of Service from time to time. Continued use of the application after changes constitutes acceptance of the new terms.</p>
<h2>7. Contact Us</h2>
<p>If you have any questions about these terms, please contact us through the details provided on our contact page.</p>
`.trim();

	const privacyPolicyHtml = `
<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, such as your name, email address, and any other details you submit when creating an account or contacting us.</p>
<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure the security of your account.</p>
<h2>3. Cookies</h2>
<p>We may use cookies and similar technologies to keep you signed in, remember your preferences, and understand how you use the application.</p>
<h2>4. Data Security</h2>
<p>We implement reasonable technical and organizational measures to protect your information from unauthorized access, alteration, or disclosure.</p>
<h2>5. Third-Party Services</h2>
<p>We may use trusted third-party services to help operate our application. These providers only have access to the information necessary to perform their functions.</p>
<h2>6. Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal information at any time by contacting us.</p>
<h2>7. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We encourage you to review this page periodically for the latest information.</p>
<h2>8. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us through the details provided on our contact page.</p>
`.trim();

	const banners: TBannerItem[] = [
		{
			image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
			title: 'Build Faster, Ship Sooner',
			subtitle: 'A production-ready Next.js + Hono + Postgres starter',
			button_label: 'Get Started',
			button_link: '/register',
			text_align: 'center',
		},
		{
			image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
			title: 'Modern Admin Dashboard',
			subtitle: 'Manage users, roles and content with ease',
			button_label: 'Explore Features',
			button_link: '/articles',
			text_align: 'left',
		},
		{
			image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
			title: 'Secure & Scalable',
			subtitle: 'Authentication, permissions and more, built in',
			button_label: 'Learn More',
			button_link: '/terms-of-service',
			text_align: 'right',
		},
	];

	const settingsSeed: { key: string; value: unknown }[] = [
		{ key: SETTING_KEYS.FAQS, value: faqs },
		{ key: SETTING_KEYS.TERMS_OF_SERVICE, value: termsOfServiceHtml },
		{ key: SETTING_KEYS.PRIVACY_POLICY, value: privacyPolicyHtml },
		{ key: SETTING_KEYS.BANNERS, value: banners },
	];

	const insertedSettings = await db
		.insert(schema.AppSettingsTable)
		.values(settingsSeed.map((s) => ({ key: s.key, group: SETTING_KEY_GROUP_MAP[s.key as keyof typeof SETTING_KEY_GROUP_MAP], value: s.value })))
		.onConflictDoNothing()
		.returning();

	console.log('settings: ', insertedSettings);

	const [adminUser] = await db.select().from(schema.UsersTable).where(eq(schema.UsersTable.email, 'admin@gmail.com')).limit(1);

	const articlesSeed = [
		{
			title: 'Getting Started with This Template',
			thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
			excerpt: 'A quick tour of the stack — Next.js, Hono, Drizzle ORM, and PostgreSQL — and how the pieces fit together.',
			content: `
<p>This template is a starting point for building full-stack applications with a modern, type-safe stack. On the frontend, it uses Next.js with the App Router. On the backend, API routes are handled by Hono, a small and fast web framework, with Drizzle ORM providing type-safe access to a PostgreSQL database.</p>
<h2>Project structure</h2>
<p>Code is organized by feature under <code>src/features</code>, with shared server logic (services, repositories, and database schemas) under <code>src/server</code>. This keeps related UI, API, and data-access code close together as the project grows.</p>
<h2>Next steps</h2>
<p>Explore the admin panel to manage articles, users, roles, and permissions, then start adapting the existing features to fit your own product.</p>
`.trim(),
			status: 'published' as const,
		},
		{
			title: 'Why We Use Hono for the API Layer',
			thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
			excerpt: 'A look at why this template pairs Next.js with Hono instead of relying solely on Next.js route handlers.',
			content: `
<p>Hono is a lightweight, fast web framework that works well in a wide range of JavaScript runtimes. In this template, it powers the API layer, giving us a clean separation between HTTP routing and the Next.js application itself.</p>
<h2>Benefits</h2>
<ul>
<li>Familiar, Express-like routing with strong TypeScript support</li>
<li>Middleware for authentication, validation, and error handling</li>
<li>Easy to test and reason about independently from the frontend</li>
</ul>
<p>Combined with Drizzle ORM, this gives you a predictable, type-safe path from HTTP request to database query and back.</p>
`.trim(),
			status: 'published' as const,
		},
		{
			title: 'Understanding Authentication & Refresh Tokens',
			thumbnail_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80',
			excerpt: 'How login sessions stay secure in this template using short-lived access tokens and rotating refresh tokens.',
			content: `
<p>This template ships with a complete authentication flow: email/password login, role-based permissions, and secure refresh token rotation.</p>
<h2>How it works</h2>
<p>When a user logs in, they receive a short-lived access token used to authorize API requests, along with a refresh token used to obtain new access tokens without requiring the user to log in again. Refresh tokens are rotated on each use and stored securely, reducing the risk of token theft and replay.</p>
<h2>Roles and permissions</h2>
<p>Access to admin features is controlled by roles and permissions, so you can define exactly what each type of user is allowed to see and do.</p>
`.trim(),
			status: 'published' as const,
		},
	];

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
