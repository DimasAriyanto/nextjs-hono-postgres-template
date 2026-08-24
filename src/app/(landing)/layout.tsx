import { NextIntlClientProvider } from 'next-intl';
import { AppLayout } from '@/layouts/app-layout';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NextIntlClientProvider>
			<AppLayout>{children}</AppLayout>
		</NextIntlClientProvider>
	);
}
