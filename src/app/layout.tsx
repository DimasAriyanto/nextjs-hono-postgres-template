import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

import { getLocale } from 'next-intl/server';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/providers';
import { getSettings } from '@/features/setting/apis/setting.api';
import type { TContentLocale, TSetting } from '@/contracts';

function getAppUrl(): string {
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/** Open Graph expects an underscore locale tag (e.g. `id_ID`), not the bare content locale we store. */
const OG_LOCALE_MAP: Record<TContentLocale, string> = {
	id: 'id_ID',
	en: 'en_US',
};

/** `Organization` JSON-LD so search engines can attribute pages to the business and surface it in Knowledge Panels. */
function buildOrganizationJsonLd(data: TSetting, appUrl: string) {
	const sameAs = data.social_links.map((link) => link.url).filter(Boolean);

	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: data.app_name,
		url: appUrl,
		description: data.description ?? undefined,
		logo: data.logo_url ?? undefined,
		sameAs: sameAs.length > 0 ? sameAs : undefined,
		...(data.contact_email || data.contact_phone
			? {
				contactPoint: {
					'@type': 'ContactPoint',
					contactType: 'customer support',
					email: data.contact_email ?? undefined,
					telephone: data.contact_phone ?? undefined,
				},
			}
			: {}),
	};
}

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
	const [{ data }, locale] = await Promise.all([getSettings(), getLocale()]);
	const appUrl = getAppUrl();
	const ogImage = data.og_image_url || data.logo_url;

	return {
		metadataBase: new URL(appUrl),
		title: {
			default: data.app_name,
			template: `%s | ${data.app_name}`,
		},
		description: data.description ?? undefined,
		icons: data.logo_url ? { icon: data.logo_url } : undefined,
		verification: data.google_site_verification ? { google: data.google_site_verification } : undefined,
		openGraph: {
			title: data.app_name,
			description: data.description ?? undefined,
			siteName: data.app_name,
			url: appUrl,
			locale: OG_LOCALE_MAP[locale as TContentLocale] ?? OG_LOCALE_MAP.id,
			images: ogImage ? [{ url: ogImage }] : undefined,
			type: 'website',
		},
		twitter: {
			card: ogImage ? 'summary_large_image' : 'summary',
			title: data.app_name,
			description: data.description ?? undefined,
			images: ogImage ? [ogImage] : undefined,
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
	const { ga_id: gaId, gtm_id: gtmId } = data;

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd(data, getAppUrl())) }}
				/>

				{primaryColor && (
					<style dangerouslySetInnerHTML={{
						__html: `:root,.dark{--primary:${primaryColor};--primary-foreground:${getReadableForeground(primaryColor)};}`,
					}}
					/>
				)}

				{gtmId && (
					<>
						<Script id="gtm-script" strategy="afterInteractive">
							{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
						</Script>
						<noscript>
							<iframe
								src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
								height="0"
								width="0"
								style={{ display: 'none', visibility: 'hidden' }}
							/>
						</noscript>
					</>
				)}

				{gaId && (
					<>
						<Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
						<Script id="ga-script" strategy="afterInteractive">
							{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
						</Script>
					</>
				)}

				<Providers>
					{children}
				</Providers>

				<Toaster closeButton position="top-right" duration={3000} />
			</body>
		</html>
	);
}
