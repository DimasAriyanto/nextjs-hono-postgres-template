import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { HomeWrapper } from '@/features/home';
import { getSettings } from '@/features/setting/apis/setting.api';
import { getPublicFaqs } from '@/features/faq/apis/faq.api';
import { toJsonLdScript } from '@/libs/seo';
import type { TContentLocale, TFaq } from '@/contracts';

export const metadata: Metadata = {
	alternates: { canonical: '/' },
};

// Fetches from the app's own API, which isn't reachable during `next build` —
// force this to render at request time instead of being prerendered at build time.
export const dynamic = 'force-dynamic';

/** `FAQPage` JSON-LD so Google can render each question directly in search results. */
function buildFaqJsonLd(faqs: TFaq[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer },
		})),
	};
}

export default async function Page() {
	const locale = await getLocale();
	const [{ data }, { data: faqs }] = await Promise.all([
		getSettings(locale as TContentLocale),
		getPublicFaqs(locale as TContentLocale),
	]);

	return (
		<>
			{faqs.length > 0 && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildFaqJsonLd(faqs)) }}
				/>
			)}
			<HomeWrapper settings={data} />
		</>
	);
}
