import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { ArticleCard } from '@/components/article-card';
import { getPublicArticles } from '@/features/article/apis/article.api';

export async function LatestArticlesSection() {
	const [t, { data: articles }] = await Promise.all([
		getTranslations('articles'),
		getPublicArticles({ page: 1, limit: 3 }),
	]);

	if (articles.length === 0) return null;

	return (
		<section className="container mx-auto px-4 md:px-6 py-16">
			<div className="flex items-end justify-between gap-4 mb-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('latestArticles')}</h2>
					<p className="text-muted-foreground mt-1">{t('description')}</p>
				</div>
				<Button variant="outline" asChild className="shrink-0">
					<Link href="/articles">
						{t('viewAll')}
						<ArrowRight className="size-4" />
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{articles.map((article) => <ArticleCard key={article.id} article={article} />)}
			</div>
		</section>
	);
}
