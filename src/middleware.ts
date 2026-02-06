import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TTokenDecoded } from './types/auth';

// middleware token verification
async function verifyToken(token: string | undefined) {
	if (!token) return { isValid: false, decoded: null };

	const res = await fetch(`${process.env.APP_URL}/api/v1/auths/profile`, {
		method: 'GET',
		headers: {
			cookie: `__x=${token}`,
		},
		cache: 'no-store', // middleware runs at Edge -> use `next: { revalidate: 0 }` to force dynamic call
	});

	const data: { message: string; data: TTokenDecoded } | null = await res.json();

	return { isValid: res.ok, decoded: data?.data };
}

export async function middleware(request: NextRequest) {
	// const host = (request.headers.get('host') || '').replace(/:\d+$/, '');
	const pathname = request.nextUrl.pathname;

	const token = request.cookies.get('__x')?.value;

	const { isValid } = await verifyToken(token);

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
