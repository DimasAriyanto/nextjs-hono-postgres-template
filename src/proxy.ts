import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'hono/jwt';

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
		const payload = await verify(jwt, process.env.APP_KEY as string, 'HS256');
		return payload as unknown as TokenPayload;
	} catch {
		return null;
	}
}

// Calls the refresh endpoint server-to-server using the refresh cookie off the incoming request.
// Returns the backend's response headers (containing rotated Set-Cookie values) on success, or null.
async function tryRefresh(request: NextRequest): Promise<Headers | null> {
	const refreshCookie = request.cookies.get('__rx')?.value;
	if (!refreshCookie) return null;

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/auths/refresh`, {
			method: 'POST',
			headers: { cookie: `__rx=${refreshCookie}` },
		});
		return res.ok ? res.headers : null;
	} catch {
		return null;
	}
}

// Re-applies rotated Set-Cookie headers (if any) onto an outgoing response
function withRefreshedCookies(response: NextResponse, refreshedHeaders: Headers | null): NextResponse {
	if (refreshedHeaders) {
		for (const setCookie of refreshedHeaders.getSetCookie()) {
			response.headers.append('Set-Cookie', setCookie);
		}
	}
	return response;
}

export async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	let payload = await getTokenPayload(request.cookies.get('__x')?.value);

	// Access token missing/expired — try a transparent refresh before making any auth decisions
	let refreshedHeaders: Headers | null = null;
	if (!payload) {
		refreshedHeaders = await tryRefresh(request);
		if (refreshedHeaders) {
			for (const setCookie of refreshedHeaders.getSetCookie()) {
				const [nameValue] = setCookie.split(';');
				const eqIdx = nameValue.indexOf('=');
				request.cookies.set(nameValue.slice(0, eqIdx), nameValue.slice(eqIdx + 1));
			}
			payload = await getTokenPayload(request.cookies.get('__x')?.value);
		}
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
		return withRefreshedCookies(response, refreshedHeaders);
	}

	// Logged in but no admin panel access → trying to access admin area
	if (isAuthenticated && !hasAdminAccess && isAdminRoute) {
		return withRefreshedCookies(NextResponse.redirect(new URL('/', request.url)), refreshedHeaders);
	}

	// Already logged in → trying to access auth pages
	if (isAuthenticated && isAuthPage) {
		const destination = hasAdminAccess ? '/gundala-admin/d' : '/';
		return withRefreshedCookies(NextResponse.redirect(new URL(destination, request.url)), refreshedHeaders);
	}

	return withRefreshedCookies(NextResponse.next({ request }), refreshedHeaders);
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
