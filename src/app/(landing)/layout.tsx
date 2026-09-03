import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { AppLayout } from '@/layouts/app-layout';
import { getSettings } from '@/features/setting/apis/setting.api';
import type { TContentLocale } from '@/contracts';

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const { data: settings } = await getSettings(locale as TContentLocale);

	return (
		<NextIntlClientProvider>
			<AppLayout settings={settings}>{children}</AppLayout>
		</NextIntlClientProvider>
	);
}
