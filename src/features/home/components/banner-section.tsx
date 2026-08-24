'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/libs/utils';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import type { TBannerItem } from '@/contracts';

const ALIGN_CLASSES: Record<NonNullable<TBannerItem['text_align']>, string> = {
	left: 'items-start text-left',
	center: 'items-center text-center',
	right: 'items-end text-right',
};

interface BannerSectionProps {
	banners: TBannerItem[];
	isLoading?: boolean;
}

export function BannerSection({ banners, isLoading }: BannerSectionProps) {
	const [api, setApi] = useState<CarouselApi>();
	const [selected, setSelected] = useState(0);

	const onSelect = useCallback((carouselApi: CarouselApi) => {
		if (!carouselApi) return;
		setSelected(carouselApi.selectedScrollSnap());
	}, []);

	useEffect(() => {
		if (!api) return;
		queueMicrotask(() => onSelect(api));
		api.on('select', onSelect);
		return () => {
			api.off('select', onSelect);
		};
	}, [api, onSelect]);

	if (isLoading) {
		return <Skeleton className="h-[320px] w-full rounded-none sm:h-[420px] md:h-[520px] xl:h-[600px]" />;
	}

	if (banners.length === 0) return null;

	return (
		<section className="relative">
			<Carousel setApi={setApi} opts={{ loop: banners.length > 1 }}>
				<CarouselContent className="ml-0">
					{banners.map((banner, index) => (
						<CarouselItem key={index} className="pl-0">
							<div className="relative h-[320px] w-full overflow-hidden sm:h-[420px] md:h-[520px] xl:h-[600px]">
								{banner.media_type === 'video' ? (
									<video
										src={banner.image_url}
										className="absolute inset-0 h-full w-full object-cover"
										autoPlay
										muted
										loop
										playsInline
									/>
								) : (
									<Image
										src={banner.image_url}
										alt={banner.title || 'Banner'}
										fill
										priority={index === 0}
										className="object-cover"
									/>
								)}
								<div className="absolute inset-0 bg-black/10" />
								<div className={cn('relative flex h-full flex-col justify-center px-6 md:px-16', ALIGN_CLASSES[banner.text_align ?? 'center'])}>
									<div className={cn('flex max-w-2xl flex-col gap-3 rounded-2xl bg-black/10 p-6 backdrop-blur-sm sm:p-8', ALIGN_CLASSES[banner.text_align ?? 'center'])}>
										{banner.title && (
											<h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">{banner.title}</h2>
										)}
										{banner.subtitle && (
											<p className="text-base text-white/90 sm:text-lg">{banner.subtitle}</p>
										)}
										{banner.button_label && banner.button_link && (
											<a
												href={banner.button_link}
												className="mt-2 inline-flex w-fit items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
											>
												{banner.button_label}
											</a>
										)}
									</div>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				{banners.length > 1 && (
					<>
						<CarouselPrevious className="left-4" />
						<CarouselNext className="right-4" />
						<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
							{banners.map((_, index) => (
								<button
									key={index}
									type="button"
									aria-label={`Go to slide ${index + 1}`}
									onClick={() => api?.scrollTo(index)}
									className={cn(
										'h-1.5 rounded-full transition-all',
										selected === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50',
									)}
								/>
							))}
						</div>
					</>
				)}
			</Carousel>
		</section>
	);
}
