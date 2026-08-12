import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/providers';
import { getSettings } from '@/features/setting/apis/setting.api';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
	const { data } = await getSettings();
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

	return {
		metadataBase: new URL(appUrl),
		title: data.app_name,
		description: data.description ?? undefined,
		icons: data.logo_url ? { icon: data.logo_url } : undefined,
		openGraph: {
			title: data.app_name,
			description: data.description ?? undefined,
			siteName: data.app_name,
			images: data.logo_url ? [{ url: data.logo_url }] : undefined,
			type: 'website',
		},
		twitter: {
			card: 'summary',
			title: data.app_name,
			description: data.description ?? undefined,
			images: data.logo_url ? [data.logo_url] : undefined,
		},
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
				<Providers>
					{children}
				</Providers>

				<Toaster closeButton position="top-right" duration={3000} />
			</body>
		</html>
	);
}
