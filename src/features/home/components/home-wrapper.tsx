import type { TSetting } from '@/contracts';
import { BannerSection } from './banner-section';
import { LatestArticlesSection } from './latest-articles-section';
import { GallerySection } from './gallery-section';
import { FaqSection } from './faq-section';

interface HomeWrapperProps {
	settings: TSetting;
}

export function HomeWrapper({ settings }: HomeWrapperProps) {
	return (
		<>
			<BannerSection banners={settings.banners} displayMode={settings.banner_display_mode} />

			<LatestArticlesSection />

			<GallerySection />

			<FaqSection faqs={settings.faqs} />
		</>
	);
}
