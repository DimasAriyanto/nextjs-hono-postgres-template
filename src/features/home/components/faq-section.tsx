import { getTranslations, getLocale } from 'next-intl/server';
import { FaqAccordion } from './faq-accordion';
import { getPublicFaqs } from '@/features/faq/apis/faq.api';
import type { TContentLocale } from '@/contracts';

export async function FaqSection() {
	const locale = await getLocale();
	const [t, { data: faqs }] = await Promise.all([
		getTranslations('home'),
		getPublicFaqs(locale as TContentLocale),
	]);

	if (faqs.length === 0) return null;

	return (
		<section className="container mx-auto px-4 md:px-6 py-16">
			<div className="mx-auto max-w-2xl text-center mb-10">
				<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('faqTitle')}</h2>
			</div>

			<FaqAccordion faqs={faqs} />
		</section>
	);
}
