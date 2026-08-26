import type { Metadata, ResolvingMetadata } from 'next';
import { getPublicArticleBySlugSafe } from '@/features/article/apis/article.api';
import { ArticleDetailWrapper } from '@/features/article';
import { extendParentSocialMetadata, getAppUrl, toJsonLdScript } from '@/libs/seo';

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
	const { slug } = await params;
	const article = await getPublicArticleBySlugSafe(slug);

	if (!article) return {};

	const url = `/articles/${article.slug}`;
	const description = article.excerpt ?? undefined;
	const social = await extendParentSocialMetadata(parent, { title: article.title, description, url });

	return {
		title: article.title,
		description,
		alternates: { canonical: url },
		openGraph: {
			...social.openGraph,
			type: 'article',
			publishedTime: article.published_at ?? undefined,
			images: article.thumbnail_url ? [{ url: article.thumbnail_url }] : social.openGraph?.images,
		},
		twitter: {
			...social.twitter,
			images: article.thumbnail_url ? [article.thumbnail_url] : social.twitter?.images,
		},
	};
}

/** `Article` JSON-LD so search results can show the headline, image and publish date directly. */
function buildArticleJsonLd(article: NonNullable<Awaited<ReturnType<typeof getPublicArticleBySlugSafe>>>, appUrl: string) {
	const author = article.author as { name?: string | null; email?: string } | null | undefined;
	const authorName = author?.name || author?.email;

	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.title,
		description: article.excerpt ?? undefined,
		image: article.thumbnail_url ? [article.thumbnail_url] : undefined,
		datePublished: article.published_at ?? undefined,
		dateModified: article.updated_at,
		author: authorName ? { '@type': 'Person', name: authorName } : undefined,
		articleSection: article.category?.name ?? undefined,
		keywords: article.tags.length > 0 ? article.tags.join(', ') : undefined,
		mainEntityOfPage: { '@type': 'WebPage', '@id': `${appUrl}/articles/${article.slug}` },
	};
}

export default async function ArticleDetailPage({ params }: Props) {
	const { slug } = await params;
	const article = await getPublicArticleBySlugSafe(slug);
	const appUrl = getAppUrl();

	return (
		<>
			{article && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildArticleJsonLd(article, appUrl)) }}
				/>
			)}
			<ArticleDetailWrapper slug={slug} />
		</>
	);
}
