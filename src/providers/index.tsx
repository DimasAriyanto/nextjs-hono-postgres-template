import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { getAccount } from '@/libs/auth-account';
import { AuthContextProvider } from './auth-provider';
import { QueryProviders } from './query-provider';

export const Providers = async ({ children }: { children: React.ReactNode }) => {
	const { user, role, token /*permissions*/ } = await getAccount();

	return (
		<NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange enableColorScheme>
			<QueryProviders>
				<NuqsAdapter>
					<AuthContextProvider user={user} role={role as string} token={token as string}>
						{children}
					</AuthContextProvider>
				</NuqsAdapter>
			</QueryProviders>
		</NextThemesProvider>
	);
};
