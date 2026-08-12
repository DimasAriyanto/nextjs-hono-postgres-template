import type { Metadata } from 'next';
import { ArticlePublicListWrapper } from '@/features/article';

export const metadata: Metadata = {
	title: 'Artikel',
	description: 'Kabar dan wawasan terbaru dari kami.',
};

export default function ArticlesPage() {
	return <ArticlePublicListWrapper />;
}
