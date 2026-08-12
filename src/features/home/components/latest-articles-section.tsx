'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleCard } from '@/components/article-card';
import { usePublicArticles } from '@/features/article/hooks/use-article';

export function LatestArticlesSection() {
	const { data, isLoading } = usePublicArticles({ page: 1, limit: 3 });
	const articles = data?.data ?? [];

	if (!isLoading && articles.length === 0) return null;

	return (
		<section className="container mx-auto px-4 md:px-6 py-16">
			<div className="flex items-end justify-between gap-4 mb-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Latest Articles</h2>
					<p className="text-muted-foreground mt-1">The latest news and insights from us.</p>
				</div>
				<Button variant="outline" asChild className="shrink-0">
					<Link href="/articles">
						View All
						<ArrowRight className="size-4" />
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading
					? Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="aspect-square w-full rounded-lg" />
					))
					: articles.map((article) => <ArticleCard key={article.id} article={article} />)
				}
			</div>
		</section>
	);
}
