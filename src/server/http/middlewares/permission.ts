import { createMiddleware } from 'hono/factory';

export const checkPermission = createMiddleware(async (c, next) => {
	await next();
});
