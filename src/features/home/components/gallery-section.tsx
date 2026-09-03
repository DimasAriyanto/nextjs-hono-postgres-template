import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getPublicGalleries } from '@/features/gallery/apis/gallery.api';

export async function GallerySection() {
	const [t, { data: images }] = await Promise.all([
		getTranslations('home'),
		getPublicGalleries({ page: 1, limit: 8 }),
	]);

	if (images.length === 0) return null;

	return (
		<section id="gallery" className="container mx-auto px-4 md:px-6 py-16">
			<div className="mb-8">
				<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('galleryTitle')}</h2>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
				{images.map((image) => (
					<div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
						<Image
							src={image.url}
							alt={image.alt_text || image.filename}
							fill
							sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</div>
				))}
			</div>
		</section>
	);
}
