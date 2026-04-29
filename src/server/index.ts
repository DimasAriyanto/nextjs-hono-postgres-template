import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { errorHandler } from '@/server/errors';
import { apiRoutes } from '@/server/http/routes';

const app = new Hono()
	.basePath('/api')
	.use(
		cors({
			origin: process.env.APP_URL as string,
			allowMethods: ['GET', 'POST', 'PUT', 'OPTION', 'DELETE'],
			credentials: true,
		}),
	)
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
