import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPageWrapper } from '@/features/setting';
import { extendParentSocialMetadata } from '@/libs/seo';

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
	const t = await getTranslations('legal');
	const title = t('titles.privacy_policy');
	const url = '/privacy-policy';

	return { title, alternates: { canonical: url }, ...(await extendParentSocialMetadata(parent, { title, url })) };
}

export default function PrivacyPolicyPage() {
	return <LegalPageWrapper field="privacy_policy" />;
}
