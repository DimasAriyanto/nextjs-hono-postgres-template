import type { Metadata } from 'next';
import { ArticlePublicListWrapper } from '@/features/article';

export const metadata: Metadata = {
	title: 'Articles',
	description: 'The latest news and insights from us.',
};

export default function ArticlesPage() {
	return <ArticlePublicListWrapper />;
}
