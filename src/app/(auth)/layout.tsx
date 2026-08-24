import { NextIntlClientProvider } from 'next-intl';
import { AuthLayout } from '@/layouts/auth-layout';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NextIntlClientProvider>
			<AuthLayout>{children}</AuthLayout>
		</NextIntlClientProvider>
	);
}
