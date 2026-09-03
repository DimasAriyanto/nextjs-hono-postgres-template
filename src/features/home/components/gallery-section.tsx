'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicGalleries } from '@/features/gallery/hooks/use-gallery';

export function GallerySection() {
	const { data, isLoading } = usePublicGalleries({ page: 1, limit: 8 });
	const t = useTranslations('home');
	const images = data?.data ?? [];

	if (!isLoading && images.length === 0) return null;

	return (
		<section id="gallery" className="container mx-auto px-4 md:px-6 py-16">
			<div className="mb-8">
				<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('galleryTitle')}</h2>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
				{isLoading
					? Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="aspect-square w-full rounded-lg" />
					))
					: images.map((image) => (
						<div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
							<Image
								src={image.url}
								alt={image.alt_text || image.filename}
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						</div>
					))
				}
			</div>
		</section>
	);
}
