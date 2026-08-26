import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { handle } from 'hono/vercel';
import { errorHandler } from '@/server/errors';
import { apiRoutes } from '@/server/http/routes';
import { env } from '@/server/env';

const app = new Hono()
	.basePath('/api')
	.use(
		cors({
			origin: env.NEXT_PUBLIC_APP_URL,
			allowMethods: ['GET', 'POST', 'PUT', 'OPTION', 'DELETE'],
			credentials: true,
		}),
	)
	// Defense-in-depth alongside the SameSite=Strict auth cookies: rejects requests
	// whose Origin/Sec-Fetch-Site header doesn't match our own origin.
	.use(csrf({ origin: env.NEXT_PUBLIC_APP_URL }))
	.onError(errorHandler);

// Main Routes v1.0
const appRouter = app
	.basePath('/v1')
	.route('/', apiRoutes);

// The handler Next.js uses to answer API requests
export const httpHandler = handle(app);

/**
 * (Optional)
 * Exporting our API here for easy deployment
 *
 * Run `npm run deploy` for one-click API deployment to Cloudflare's edge network
 */
export default app;

// export type definition of API
export type AppType = typeof appRouter;
