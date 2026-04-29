'use client';

import * as React from 'react';
import { X, ZoomIn } from 'lucide-react';
import { cn } from '@/libs/utils';

interface ImagePreviewProps {
	src: string;
	alt?: string;
	className?: string;
	thumbnailClassName?: string;
}

export function ImagePreview({ src, alt = 'Preview', className, thumbnailClassName }: ImagePreviewProps) {
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		if (open) document.addEventListener('keydown', handleKey);
		return () => document.removeEventListener('keydown', handleKey);
	}, [open]);

	return (
		<>
			<div
				role="button"
				tabIndex={0}
				className={cn('group relative inline-block cursor-zoom-in overflow-hidden rounded-md', thumbnailClassName)}
				onClick={() => setOpen(true)}
				onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={src} alt={alt} className={cn('object-cover', className)} />
				<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
					<ZoomIn className="size-6 text-white" />
				</div>
			</div>

			{open && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
					onClick={() => setOpen(false)}
				>
					<button
						className="absolute right-4 top-4 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
						onClick={() => setOpen(false)}
						aria-label="Tutup"
					>
						<X className="size-5" />
					</button>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={src}
						alt={alt}
						className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			)}
		</>
	);
}
