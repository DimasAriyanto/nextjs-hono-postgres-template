import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateSignedCookie } from 'hono/cookie';
import { parseSigned } from 'hono/utils/cookie';
import { authService } from '@/server/services/auth.service';

function getReturnUrl(request: Request) {
	const requested = new URL(request.url).searchParams.get('returnTo') || '/';
	const url = new URL(request.url);
	const returnUrl = new URL(requested, url.origin);
	return returnUrl.origin === url.origin ? returnUrl : new URL('/', url.origin);
}

export async function GET(request: Request) {
	const cookieStore = await cookies();
	const refreshCookie = cookieStore.get('__rx')?.value;
	const returnUrl = getReturnUrl(request);

	if (!refreshCookie) {
		return NextResponse.redirect(returnUrl);
	}

	try {
		const config = authService.getRefreshCookieConfig();
		const parsed = await parseSigned(`__rx=${refreshCookie}`, config.secret, config.name);
		const rawRefreshToken = parsed[config.name];

		if (!rawRefreshToken) throw new Error('Invalid refresh cookie');

		const result = await authService.refresh(rawRefreshToken);
		const accessConfig = authService.getCookieConfig();
		const response = NextResponse.redirect(returnUrl);

		response.headers.append(
			'Set-Cookie',
			await generateSignedCookie(accessConfig.name, result.token, accessConfig.secret, accessConfig.options),
		);
		response.headers.append(
			'Set-Cookie',
			await generateSignedCookie(config.name, result.refreshToken, config.secret, config.options),
		);

		return response;
	} catch (error) {
		console.warn('[auth-refresh] refresh failed', error instanceof Error ? error.message : error);
		const response = NextResponse.redirect(returnUrl);
		response.cookies.delete('__x');
		response.cookies.delete('__rx');
		return response;
	}
}
