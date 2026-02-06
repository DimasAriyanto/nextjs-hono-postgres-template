import { client } from '@/libs/hono-client';
import { TSigninRequest } from '../types/authentication';

export const signinRequest = async (request: TSigninRequest) => {
	const response = await client.api.v1.auths.signin.$post({
		json: request,
	});

	if (!response.ok) {
		const { message } = await response.json();
		throw new Error(message);
	}

	const data = await response.json();

	return { ...data, status: response.status };
};

export const requestLogout = async () => {
	const response = await client.api.v1.auths.signout.$get();

	return await response.json();
};
