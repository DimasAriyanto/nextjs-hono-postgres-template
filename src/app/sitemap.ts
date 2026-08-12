import type { MetadataRoute } from 'next';
import { getPublicArticles } from '@/features/article/apis/article.api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

	const { data: articles } = await getPublicArticles({ page: 1, limit: 100 });

	const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
		url: `${appUrl}/articles/${article.slug}`,
		lastModified: article.published_at ?? article.updated_at,
		changeFrequency: 'monthly',
		priority: 0.7,
	}));

	return [
		{
			url: appUrl,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 1,
		},
		{
			url: `${appUrl}/articles`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		...articleEntries,
	];
}
