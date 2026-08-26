import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArticlePublicListWrapper } from '@/features/article';
import { extendParentSocialMetadata } from '@/libs/seo';

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
	const t = await getTranslations('articles');
	const title = t('title');
	const description = t('description');
	const url = '/articles';

	return {
		title,
		description,
		alternates: { canonical: url },
		...(await extendParentSocialMetadata(parent, { title, description, url })),
	};
}

export default function ArticlesPage() {
	return <ArticlePublicListWrapper />;
}
