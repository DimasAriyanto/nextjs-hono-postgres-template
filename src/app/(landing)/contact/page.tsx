import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactPageWrapper } from '@/features/setting';
import { extendParentSocialMetadata } from '@/libs/seo';

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
	const t = await getTranslations('contact');
	const title = t('title');
	const url = '/contact';

	return { title, alternates: { canonical: url }, ...(await extendParentSocialMetadata(parent, { title, url })) };
}

export default function ContactPage() {
	return <ContactPageWrapper />;
}
