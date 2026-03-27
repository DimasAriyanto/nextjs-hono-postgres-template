import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'hono/jwt';

// Signed cookie format from Hono: jwt.hmacSignature
// Extract the JWT part (everything before the last dot)
function extractJwtFromSignedCookie(cookieValue: string): string | null {
	const lastDot = cookieValue.lastIndexOf('.');
	if (lastDot === -1) return null;
	return cookieValue.slice(0, lastDot);
}

async function verifyToken(request: NextRequest): Promise<boolean> {
	const cookieValue = request.cookies.get('__x')?.value;
	if (!cookieValue) return false;

	const jwt = extractJwtFromSignedCookie(cookieValue);
	if (!jwt) return false;

	try {
		await verify(jwt, process.env.APP_KEY as string, 'HS256');
		return true;
	} catch {
		return false;
	}
}

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	const isValid = await verifyToken(request);

	const isAuthPage = pathname === '/login' || pathname === '/forgot-password';
	const isProtected = pathname.startsWith('/gundala-admin') && !isAuthPage;

	// not logged in -> trying to access protected page
	if (!isValid && isProtected) {
		const response = NextResponse.redirect(new URL('/login', request.url));
		response.cookies.delete('__x');
		return response;
	}

	// logged in -> trying to access login
	if (isValid && isAuthPage) {
		return NextResponse.redirect(new URL('/gundala-admin/d', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/gundala-admin/:path*', '/login', '/forgot-password'],
};
