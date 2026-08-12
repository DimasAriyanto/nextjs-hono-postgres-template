'use client';

import { useSettings } from '@/features/setting/hooks/use-setting';
import { LatestArticlesSection } from './latest-articles-section';
import { FaqSection } from './faq-section';

export function HomeWrapper() {
	const { data: settingsRes } = useSettings();
	const settings = settingsRes?.data;

	return (
		<>
			<section className="container mx-auto px-4 md:px-6 py-20 text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
					{settings?.app_name ?? 'Welcome'}
				</h1>
				{settings?.description && (
					<p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">{settings.description}</p>
				)}
			</section>

			<LatestArticlesSection />

			<FaqSection faqs={settings?.faqs ?? []} />
		</>
	);
}
