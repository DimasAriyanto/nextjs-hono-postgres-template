import { createMiddleware } from 'hono/factory';
import { getSignedCookie, deleteCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
// import type { TTokenDecoded } from '@/types/auth';

export const auth = createMiddleware(async (c, next) => {
	try {
		const device = c.req.header('x-device');
		let token: string | false | undefined;

		if (device === 'mobile' || device === 'external') {
			token = c.req.header('authorization')?.replace('Bearer ', '') as string;
		} else {
			token = await getSignedCookie(c, process.env.APP_COOKIE_KEY as string, '__x');
		}

		if (!token) throw new HTTPException(401, { message: `An invalid credentials error occurred` });

		const decoded = await verify(token as string, process.env.APP_KEY as string);

		c.set('user', decoded);
		c.set('role', decoded.aurl);
		c.set('token', token);
		await next();
	} catch {
		deleteCookie(c, '__x');
		throw new HTTPException(403, { message: `An forbidden access error occurred` });
	}
});
