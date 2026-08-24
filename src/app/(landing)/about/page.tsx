import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPageWrapper } from '@/features/setting';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('legal');
	return { title: t('titles.about_content') };
}

export default function AboutPage() {
	return <LegalPageWrapper field="about_content" />;
}
