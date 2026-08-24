import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { getLocale } from 'next-intl/server';
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
		title: {
			default: data.app_name,
			template: `%s | ${data.app_name}`,
		},
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

/** Picks a readable foreground (near-black or near-white) for a given hex background, by relative luminance. */
function getReadableForeground(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	return luminance > 0.6 ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)';
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [{ data }, locale] = await Promise.all([getSettings(), getLocale()]);
	const primaryColor = data.primary_color;

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
				{primaryColor && (
					<style dangerouslySetInnerHTML={{
						__html: `:root,.dark{--primary:${primaryColor};--primary-foreground:${getReadableForeground(primaryColor)};}`,
					}}
					/>
				)}

				<Providers>
					{children}
				</Providers>

				<Toaster closeButton position="top-right" duration={3000} />
			</body>
		</html>
	);
}
