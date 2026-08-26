import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { bodyLimit } from 'hono/body-limit';
import { handle } from 'hono/vercel';
import { errorHandler } from '@/server/errors';
import { apiRoutes } from '@/server/http/routes';
import { env } from '@/server/env';

// No route accepts a larger body than a video upload — sized off the same env var
// the upload controller uses, plus headroom for multipart boundary/field overhead.
// Without this, an unbounded request body (e.g. a giant JSON array) gets fully
// buffered in memory before any route-level validation ever sees it.
const MAX_BODY_SIZE = (Number(process.env.UPLOAD_MAX_VIDEO_SIZE) || 50 * 1024 * 1024) + 5 * 1024 * 1024;

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
	.use(bodyLimit({ maxSize: MAX_BODY_SIZE }))
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
