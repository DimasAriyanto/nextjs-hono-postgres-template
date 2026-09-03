'use client';

import { useLocale } from 'next-intl';
import { useSettings } from '@/features/setting/hooks/use-setting';
import type { TContentLocale } from '@/contracts';
import { BannerSection } from './banner-section';
import { LatestArticlesSection } from './latest-articles-section';
import { GallerySection } from './gallery-section';
import { FaqSection } from './faq-section';

export function HomeWrapper() {
	const locale = useLocale() as TContentLocale;
	const { data: settingsRes, isLoading } = useSettings(locale);
	const settings = settingsRes?.data;

	return (
		<>
			<BannerSection banners={settings?.banners ?? []} isLoading={isLoading} displayMode={settings?.banner_display_mode} />

			<LatestArticlesSection />

			<GallerySection />

			<FaqSection faqs={settings?.faqs ?? []} isLoading={isLoading} />
		</>
	);
}
