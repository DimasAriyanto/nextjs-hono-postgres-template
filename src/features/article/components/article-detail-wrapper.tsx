import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { formatTZ } from '@/libs/dayjs';
import { ArticleCard } from '@/components/article-card';
import { getPublicArticleBySlugSafe, getRelatedArticles } from '@/features/article/apis/article.api';

interface ArticleDetailWrapperProps {
	slug: string;
}

export async function ArticleDetailWrapper({ slug }: ArticleDetailWrapperProps) {
	const article = await getPublicArticleBySlugSafe(slug);

	if (!article) notFound();

	const relatedArticles = await getRelatedArticles(article.id);
	const author = article.author as { name?: string | null; email?: string } | null | undefined;

	return (
		<article className="container mx-auto max-w-3xl px-4 md:px-6 py-16">
			<Link href="/articles" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
				<ArrowLeft className="size-4" />
				Back to Articles
			</Link>

			<header className="mt-6 space-y-3">
				<h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
				<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					{article.published_at && <span>{formatTZ(article.published_at, 'D MMMM YYYY')}</span>}
					{(author?.name || author?.email) && (
						<>
							<span>&middot;</span>
							<span>{author.name || author.email}</span>
						</>
					)}
				</div>
			</header>

			{article.thumbnail_url && (
				<div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg bg-muted">
					<Image src={article.thumbnail_url} alt={article.title} fill className="object-cover" priority />
				</div>
			)}

			<div
				className="prose-content mt-8 max-w-none [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:my-4 [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5"
				dangerouslySetInnerHTML={{ __html: article.content }}
			/>

			{relatedArticles.length > 0 && (
				<div className="mt-16 border-t border-border pt-10">
					<h2 className="mb-6 text-xl font-bold tracking-tight">Related Articles</h2>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{relatedArticles.map((related) => (
							<ArticleCard key={related.id} article={related} />
						))}
					</div>
				</div>
			)}
		</article>
	);
}
