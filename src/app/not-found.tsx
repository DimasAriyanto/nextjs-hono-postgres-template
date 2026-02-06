import React from 'react';
import { getAccount } from '@/libs/auth-account';
import { AuthContextProvider } from '@/providers/auth-provider';
import { ErrorNotFound } from '@/components/error-not-found';

import './globals.css';

export default async function NotFound() {
	const { user, role, token /*permissions*/ } = await getAccount();

	if (user && token) {
		return (
			<AuthContextProvider user={user} role={role as string} token={token as string}>
					<ErrorNotFound isPage={false} />
			</AuthContextProvider>
		);
	}

	return <ErrorNotFound />;
}
