import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'hono/jwt';
import { env } from '@/server/env';

interface TokenPayload {
	auid: string;
	aurl: string; // 'admin' | 'user'
	aper?: boolean; // has admin panel access (is_admin OR has at least one menu permission)
	uenv: string;
	exp: number;
	iat: number;
}

// Signed cookie format from Hono: jwt.hmacSignature
// Extract the JWT part (everything before the last dot)
function extractJwtFromSignedCookie(cookieValue: string): string | null {
	const lastDot = cookieValue.lastIndexOf('.');
	if (lastDot === -1) return null;
	return cookieValue.slice(0, lastDot);
}

async function getTokenPayload(cookieValue: string | undefined): Promise<TokenPayload | null> {
	if (!cookieValue) return null;

	const jwt = extractJwtFromSignedCookie(cookieValue);
	if (!jwt) return null;

	try {
		const payload = await verify(jwt, env.APP_KEY, 'HS256');
		return payload as unknown as TokenPayload;
	} catch {
		return null;
	}
}

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	const payload = await getTokenPayload(request.cookies.get('__x')?.value);

	// Proxy stays a lightweight guard. The Route Handler owns refresh and cookie writes.
	if (!payload && request.cookies.get('__rx')?.value) {
		const refreshUrl = new URL('/auth/refresh', request.url);
		refreshUrl.searchParams.set('returnTo', `${pathname}${request.nextUrl.search}`);
		return NextResponse.redirect(refreshUrl);
	}

	const isAuthenticated = payload !== null;
	// Admin-panel access: either the elevated is_admin role, or at least one menu permission granted to the user's role
	const hasAdminAccess = payload?.aper === true;

	const isAuthPage = pathname === '/login' || pathname === '/forgot-password' || pathname === '/register';
	const isAdminRoute = pathname.startsWith('/gundala-admin');

	// Not logged in → trying to access admin area
	if (!isAuthenticated && isAdminRoute) {
		const response = NextResponse.redirect(new URL('/login', request.url));
		response.cookies.delete('__x');
		return response;
	}

	// Logged in but no admin panel access → trying to access admin area
	if (isAuthenticated && !hasAdminAccess && isAdminRoute) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	// Already logged in → trying to access auth pages
	if (isAuthenticated && isAuthPage) {
		const destination = hasAdminAccess ? '/gundala-admin/d' : '/';
		return NextResponse.redirect(new URL(destination, request.url));
	}

	return NextResponse.next({ request });
}

export const config = {
	matcher: ['/((?!api|auth/refresh|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
