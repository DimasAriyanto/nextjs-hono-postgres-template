import { hc } from 'hono/client';
import { AppType } from '@/server';

const REFRESH_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/auths/refresh`;

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
	if (!refreshPromise) {
		refreshPromise = fetch(REFRESH_URL, { method: 'POST', credentials: 'include' })
			.then((res) => res.ok)
			.catch(() => false)
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
}

const fetchWithRefresh: typeof fetch = async (input, init) => {
	const response = await fetch(input, init);

	const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
	if (response.status !== 401 || url.includes('/auths/refresh')) {
		return response;
	}

	let code: string | undefined;
	try {
		const body = await response.clone().json();
		code = body?.errors?.code;
	} catch {
		return response;
	}

	// AUTH_UNAUTHORIZED = no access token cookie at all (the common case once maxAge elapses and
	// the browser drops it); AUTH_TOKEN_EXPIRED = cookie present but the JWT's exp claim has passed.
	// Both are worth a refresh attempt. AUTH_FORBIDDEN (invalid/tampered token) is not.
	if (code !== 'AUTH_TOKEN_EXPIRED' && code !== 'AUTH_UNAUTHORIZED') {
		return response;
	}

	const refreshed = await refreshAccessToken();
	if (!refreshed) {
		return response;
	}

	return fetch(input, init);
};

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL as string, {
	init: {
		credentials: 'include',
	},
	fetch: fetchWithRefresh,
});
