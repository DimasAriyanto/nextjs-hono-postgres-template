import { createMiddleware } from 'hono/factory';
import { getSignedCookie, deleteCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { AuthError } from '@/server/errors';

export const auth = createMiddleware(async (c, next) => {
	try {
		const device = c.req.header('x-device');
		let token: string | false | undefined;

		if (device === 'mobile' || device === 'external') {
			token = c.req.header('authorization')?.replace('Bearer ', '') as string;
		} else {
			token = await getSignedCookie(c, process.env.APP_COOKIE_KEY as string, '__x');
		}

		if (!token) {
			throw AuthError.unauthorized();
		}

		const decoded = await verify(token as string, process.env.APP_KEY as string);

		c.set('user', decoded);
		c.set('role', decoded.aurl);
		c.set('token', token);
		await next();
	} catch (err) {
		deleteCookie(c, '__x');
		// Re-throw if it's already an AuthError
		if (err instanceof AuthError) {
			throw err;
		}
		throw AuthError.forbidden();
	}
});
