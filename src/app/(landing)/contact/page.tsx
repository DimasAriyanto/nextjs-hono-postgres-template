import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactPageWrapper } from '@/features/setting';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('contact');
	return { title: t('title') };
}

export default function ContactPage() {
	return <ContactPageWrapper />;
}
