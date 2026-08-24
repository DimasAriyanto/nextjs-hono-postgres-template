import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArticlePublicListWrapper } from '@/features/article';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('articles');
	return { title: t('title'), description: t('description') };
}

export default function ArticlesPage() {
	return <ArticlePublicListWrapper />;
}
