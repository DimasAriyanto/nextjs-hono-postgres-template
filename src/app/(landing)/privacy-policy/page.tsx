import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPageWrapper } from '@/features/setting';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('legal');
	return { title: t('titles.privacy_policy') };
}

export default function PrivacyPolicyPage() {
	return <LegalPageWrapper field="privacy_policy" />;
}
