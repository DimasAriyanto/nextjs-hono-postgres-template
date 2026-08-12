import { cookies } from 'next/headers';
import { client } from './hono-client';
import type { TProfileResponse } from '@/contracts';

export const getAccount = async () => {
	const cookieStore = await cookies();
	const token = cookieStore.get('__x');

	const response = await client.api.v1.auths.profile.$get(
		{},
		{
			headers: {
				cookie: `__x=${token?.value}`,
			},
		},
	);

	const data: { message: string; data: TProfileResponse } | null = response.ok ? await response.json() : null;

	const isAdmin = data?.data?.roles?.some((r) => r.is_admin) ?? false;

	return {
		status: response.status,
		user: data?.data,
		role: isAdmin ? 'admin' : 'user',
		token: token?.value,
		permissions: data?.data?.permissions ?? [],
	};
};
