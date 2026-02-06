import { cookies } from 'next/headers';
import { client } from './hono-client';
import type { TTokenPayload } from '@/contracts';

export const getAccount = async () => {
	const cookieStore = await cookies();
	const token = cookieStore.get('__x');
	// const perms = cookieStore.get("__perms");

	const response = await client.api.v1.auths.profile.$get(
		{},
		{
			headers: {
				cookie: `__x=${token?.value}`,
			},
		},
	);

	const data: { message: string; data: TTokenPayload } | null = response.ok ? await response.json() : null;

	// const permissions: string[] = response.status === 200 && perms ? JSON.parse(decoded(perms?.value)) : [];

	return {
		status: response.status,
		user: data?.data,
		role: data?.data?.aurl,
		token: token?.value,
		// permissions,
	};
};
