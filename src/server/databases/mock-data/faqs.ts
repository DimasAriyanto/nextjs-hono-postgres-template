import type { TFaqItem } from '@/contracts/setting';

export const faqsEn: TFaqItem[] = [
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

export const faqsId: TFaqItem[] = [
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
