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

	const faqsEn: TFaqItem[] = [
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

	const faqsId: TFaqItem[] = [
		{
			question: 'Template ini dibuat dengan apa?',
			answer:
				'Next.js (App Router) untuk frontend, Hono sebagai API layer, Drizzle ORM untuk akses database yang type-safe, dan PostgreSQL sebagai database.',
		},
		{
			question: 'Bagaimana cara menjalankan proyek ini secara lokal?',
			answer:
				'Salin .env.example menjadi .env, atur kredensial database Anda, lalu jalankan dev server. Database dan skemanya dibuat otomatis saat pertama kali menjalankan migration.',
		},
		{
			question: 'Apakah sudah termasuk autentikasi bawaan?',
			answer:
				'Ya. Login email/kata sandi, izin berbasis peran, dan rotasi refresh token yang aman sudah terpasang sehingga Anda bisa langsung membangun fitur.',
		},
		{
			question: 'Bisakah saya beralih antara database PostgreSQL lokal dan Supabase?',
			answer:
				'Bisa. Atur DB_PROVIDER menjadi "local" atau "supabase" di environment variable — lapisan koneksi akan otomatis memilih konfigurasi yang tepat.',
		},
		{
			question: 'Komponen UI apa saja yang tersedia?',
			answer:
				'Sekumpulan komponen yang aksesibel dan dapat di-theming (tabel, form, modal, rich text editor, dan lainnya) dibangun dengan Tailwind CSS, siap dipakai di panel admin maupun halaman publik Anda.',
		},
		{
			question: 'Apakah template ini gratis digunakan dan dimodifikasi?',
			answer: 'Ya, template ini dimaksudkan sebagai titik awal untuk proyek Anda sendiri — gunakan, kembangkan, dan sesuaikan dengan kebutuhan Anda.',
		},
	];

	const aboutContentHtmlEn = `
<h2>Who We Are</h2>
<p>We're a small team building tools that help businesses launch faster without reinventing the basics. This application started as an internal starter kit and grew into a product we're proud to share.</p>
<h2>Our Mission</h2>
<p>We believe teams should spend their time solving problems unique to their business — not rebuilding authentication, admin panels, and content management from scratch every time. Our mission is to give you a solid, production-ready foundation so you can focus on what makes your product different.</p>
<h2>What We Value</h2>
<ul>
<li><strong>Simplicity</strong> — clear, predictable code over clever abstractions.</li>
<li><strong>Reliability</strong> — every feature is built to be dependable in production, not just a demo.</li>
<li><strong>Transparency</strong> — no hidden magic; you can read and understand every part of the stack.</li>
</ul>
<h2>Get in Touch</h2>
<p>Have questions about what we do or how we can help? Visit our <a href="/contact">contact page</a> — we'd love to hear from you.</p>
`.trim();

	const aboutContentHtmlId = `
<h2>Siapa Kami</h2>
<p>Kami adalah tim kecil yang membangun tools untuk membantu bisnis meluncurkan produk lebih cepat tanpa perlu membangun ulang hal-hal dasar. Aplikasi ini bermula sebagai starter kit internal dan berkembang menjadi produk yang kami banggakan untuk dibagikan.</p>
<h2>Misi Kami</h2>
<p>Kami percaya tim seharusnya menghabiskan waktu untuk menyelesaikan masalah yang unik bagi bisnis mereka — bukan membangun ulang autentikasi, panel admin, dan manajemen konten dari nol setiap saat. Misi kami adalah memberikan fondasi yang solid dan siap produksi agar Anda bisa fokus pada apa yang membuat produk Anda berbeda.</p>
<h2>Yang Kami Junjung</h2>
<ul>
<li><strong>Kesederhanaan</strong> — kode yang jelas dan mudah diprediksi, bukan abstraksi yang rumit.</li>
<li><strong>Keandalan</strong> — setiap fitur dibangun agar dapat diandalkan di production, bukan sekadar demo.</li>
<li><strong>Transparansi</strong> — tidak ada yang disembunyikan; Anda bisa membaca dan memahami setiap bagian dari stack ini.</li>
</ul>
<h2>Hubungi Kami</h2>
<p>Ada pertanyaan tentang apa yang kami lakukan atau bagaimana kami bisa membantu? Kunjungi <a href="/contact">halaman kontak</a> kami — kami senang mendengar dari Anda.</p>
`.trim();

	const termsOfServiceHtmlEn = `
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

	const termsOfServiceHtmlId = `
<h2>1. Penerimaan Ketentuan</h2>
<p>Dengan mengakses atau menggunakan aplikasi ini, Anda setuju untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, mohon untuk tidak menggunakan aplikasi.</p>
<h2>2. Penggunaan Aplikasi</h2>
<p>Anda setuju untuk menggunakan aplikasi ini hanya untuk tujuan yang sah dan dengan cara yang tidak melanggar hak, membatasi, atau menghalangi penggunaan oleh orang lain.</p>
<h2>3. Akun</h2>
<p>Saat membuat akun bersama kami, Anda wajib memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab menjaga kerahasiaan kata sandi Anda dan setiap aktivitas di bawah akun Anda.</p>
<h2>4. Kekayaan Intelektual</h2>
<p>Seluruh konten, fitur, dan fungsionalitas aplikasi ini dimiliki oleh kami dan dilindungi oleh hukum kekayaan intelektual yang berlaku.</p>
<h2>5. Batasan Tanggung Jawab</h2>
<p>Kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, maupun konsekuensial yang timbul dari penggunaan aplikasi ini.</p>
<h2>6. Perubahan Ketentuan Ini</h2>
<p>Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Penggunaan aplikasi yang berlanjut setelah perubahan berarti Anda menerima ketentuan yang baru.</p>
<h2>7. Hubungi Kami</h2>
<p>Jika Anda memiliki pertanyaan tentang ketentuan ini, silakan hubungi kami melalui detail yang tersedia di halaman kontak kami.</p>
`.trim();

	const privacyPolicyHtmlEn = `
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

	const privacyPolicyHtmlId = `
<h2>1. Informasi yang Kami Kumpulkan</h2>
<p>Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti nama, alamat email, dan detail lain yang Anda kirimkan saat membuat akun atau menghubungi kami.</p>
<h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
<p>Kami menggunakan informasi yang dikumpulkan untuk menyediakan, memelihara, dan meningkatkan layanan kami, berkomunikasi dengan Anda, dan menjaga keamanan akun Anda.</p>
<h2>3. Cookie</h2>
<p>Kami dapat menggunakan cookie dan teknologi serupa untuk menjaga Anda tetap masuk, mengingat preferensi Anda, dan memahami bagaimana Anda menggunakan aplikasi ini.</p>
<h2>4. Keamanan Data</h2>
<p>Kami menerapkan langkah teknis dan organisasi yang wajar untuk melindungi informasi Anda dari akses, perubahan, atau pengungkapan yang tidak sah.</p>
<h2>5. Layanan Pihak Ketiga</h2>
<p>Kami dapat menggunakan layanan pihak ketiga tepercaya untuk membantu mengoperasikan aplikasi kami. Penyedia ini hanya memiliki akses ke informasi yang diperlukan untuk menjalankan fungsinya.</p>
<h2>6. Hak Anda</h2>
<p>Anda dapat meminta akses, koreksi, atau penghapusan informasi pribadi Anda kapan saja dengan menghubungi kami.</p>
<h2>7. Perubahan Kebijakan Ini</h2>
<p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami menyarankan Anda meninjau halaman ini secara berkala untuk informasi terbaru.</p>
<h2>8. Hubungi Kami</h2>
<p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui detail yang tersedia di halaman kontak kami.</p>
`.trim();

	const bannersEn: TBannerItem[] = [
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

	const bannersId: TBannerItem[] = [
		{
			image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
			title: 'Bangun Lebih Cepat, Rilis Lebih Cepat',
			subtitle: 'Starter Next.js + Hono + Postgres yang siap production',
			button_label: 'Mulai Sekarang',
			button_link: '/register',
			text_align: 'center',
		},
		{
			image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
			title: 'Dashboard Admin Modern',
			subtitle: 'Kelola pengguna, peran, dan konten dengan mudah',
			button_label: 'Jelajahi Fitur',
			button_link: '/articles',
			text_align: 'left',
		},
		{
			image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
			title: 'Aman & Skalabel',
			subtitle: 'Autentikasi, izin, dan lainnya, sudah terpasang',
			button_label: 'Pelajari Lebih Lanjut',
			button_link: '/terms-of-service',
			text_align: 'right',
		},
	];

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
