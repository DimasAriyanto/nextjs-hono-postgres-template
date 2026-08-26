export const articlesSeed = [
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
		category: 'Tutorials',
		tags: ['nextjs', 'hono', 'drizzle', 'getting-started'],
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
		category: 'Backend',
		tags: ['hono', 'api', 'backend'],
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
		category: 'Security',
		tags: ['authentication', 'security', 'refresh-token'],
	},
];
