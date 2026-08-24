import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPageWrapper } from '@/features/setting';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('legal');
	return { title: t('titles.terms_of_service') };
}

export default function TermsOfServicePage() {
	return <LegalPageWrapper field="terms_of_service" />;
}
