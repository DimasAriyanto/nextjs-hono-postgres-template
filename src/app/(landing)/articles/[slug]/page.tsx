import type { Metadata } from 'next';
import { getPublicArticleBySlugSafe } from '@/features/article/apis/article.api';
import { ArticleDetailWrapper } from '@/features/article';

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const article = await getPublicArticleBySlugSafe(slug);

	if (!article) return {};

	return {
		title: article.title,
		description: article.excerpt ?? undefined,
		openGraph: {
			title: article.title,
			description: article.excerpt ?? undefined,
			type: 'article',
			publishedTime: article.published_at ?? undefined,
			images: article.thumbnail_url ? [{ url: article.thumbnail_url }] : undefined,
		},
	};
}

export default async function ArticleDetailPage({ params }: Props) {
	const { slug } = await params;
	return <ArticleDetailWrapper slug={slug} />;
}
