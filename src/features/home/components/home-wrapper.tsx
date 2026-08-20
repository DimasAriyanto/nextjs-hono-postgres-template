'use client';

import { useSettings } from '@/features/setting/hooks/use-setting';
import { BannerSection } from './banner-section';
import { LatestArticlesSection } from './latest-articles-section';
import { FaqSection } from './faq-section';

export function HomeWrapper() {
	const { data: settingsRes, isLoading } = useSettings();
	const settings = settingsRes?.data;

	return (
		<>
			<BannerSection banners={settings?.banners ?? []} isLoading={isLoading} />

			<LatestArticlesSection />

			<FaqSection faqs={settings?.faqs ?? []} isLoading={isLoading} />
		</>
	);
}
