import Image from 'next/image';
import Link from 'next/link';
import { ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTZ } from '@/libs/dayjs';
import type { TArticleWithAuthor } from '@/contracts';

interface ArticleCardProps {
	article: TArticleWithAuthor;
}

export function ArticleCard({ article }: ArticleCardProps) {
	return (
		<Link
			href={`/articles/${article.slug}`}
			className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
		>
			<div className="relative aspect-video w-full bg-muted">
				{article.thumbnail_url ? (
					<Image
						src={article.thumbnail_url}
						alt={article.title}
						fill
						sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground">
						<ImageOff className="size-8" />
					</div>
				)}
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				{article.category?.name && (
					<Badge variant="secondary" className="w-fit text-xs">{article.category.name}</Badge>
				)}
				{article.published_at && (
					<span className="text-xs text-muted-foreground">{formatTZ(article.published_at, 'D MMMM YYYY')}</span>
				)}
				<h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary transition-colors">
					{article.title}
				</h3>
				{article.excerpt && (
					<p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
				)}
			</div>
		</Link>
	);
}
