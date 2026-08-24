'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleCard } from '@/components/article-card';
import { usePublicArticles } from '@/features/article/hooks/use-article';

const PAGE_SIZE = 9;

export function ArticlePublicListWrapper() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = usePublicArticles({ page, limit: PAGE_SIZE });
	const t = useTranslations('articles');

	const articles = data?.data ?? [];
	const pagination = data?.meta?.pagination;

	return (
		<div className="container mx-auto px-4 md:px-6 py-16">
			<div className="mb-10 text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
				<p className="mt-2 text-muted-foreground">{t('description')}</p>
			</div>

			{isLoading ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: PAGE_SIZE }).map((_, i) => (
						<Skeleton key={i} className="aspect-square w-full rounded-lg" />
					))}
				</div>
			) : articles.length === 0 ? (
				<p className="py-20 text-center text-muted-foreground">{t('empty')}</p>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => (
						<ArticleCard key={article.id} article={article} />
					))}
				</div>
			)}

			{pagination && pagination.totalPages > 1 && (
				<div className="mt-10 flex items-center justify-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page <= 1}
					>
						<ChevronLeft className="size-4" />
						{t('previous')}
					</Button>
					<span className="text-sm text-muted-foreground">
						{t('page', { page: pagination.page, totalPages: pagination.totalPages })}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
						disabled={page >= pagination.totalPages}
					>
						{t('next')}
						<ChevronRight className="size-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
