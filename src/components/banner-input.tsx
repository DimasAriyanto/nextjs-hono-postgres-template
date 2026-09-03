'use client';

import { useEffect, useRef, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, ImageIcon, Plus, Trash2, Video, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { cn } from '@/libs/utils';
import type { TBannerItem, TBannerMediaType, TBannerTextAlign } from '@/contracts';

const TEXT_ALIGN_OPTIONS: { value: TBannerTextAlign; icon: typeof AlignLeft; label: string }[] = [
	{ value: 'left', icon: AlignLeft, label: 'Align left' },
	{ value: 'center', icon: AlignCenter, label: 'Align center' },
	{ value: 'right', icon: AlignRight, label: 'Align right' },
];

const MEDIA_TYPE_OPTIONS: { value: TBannerMediaType; icon: typeof ImageIcon; label: string }[] = [
	{ value: 'image', icon: ImageIcon, label: 'Image' },
	{ value: 'video', icon: Video, label: 'Video' },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export interface PendingBannerFile {
	file: File;
	mediaType: TBannerMediaType;
}

interface BannerInputProps {
	value: TBannerItem[];
	onChange: (value: TBannerItem[]) => void;
	/** Files picked but not yet uploaded, keyed by banner index — uploaded by the parent form on Save */
	pendingFiles: Record<number, PendingBannerFile>;
	onPendingFilesChange: (files: Record<number, PendingBannerFile>) => void;
	disabled?: boolean;
	className?: string;
}

export function BannerInput({ value, onChange, pendingFiles, onPendingFilesChange, disabled, className }: BannerInputProps) {
	// Blob preview URLs for pending files, keyed by banner index. Derived during render
	// (mirroring the `pendingFiles` prop it derives from) rather than in an effect, so a
	// newly picked file's preview is available immediately — see file-upload.tsx for the
	// same technique.
	const [previews, setPreviews] = useState<Map<number, string>>(() => new Map());
	const [previewedPendingFiles, setPreviewedPendingFiles] = useState(pendingFiles);
	if (pendingFiles !== previewedPendingFiles) {
		const prevPendingFiles = previewedPendingFiles;
		setPreviewedPendingFiles(pendingFiles);
		setPreviews((prev) => {
			let changed = false;
			const next = new Map(prev);
			for (const idx of next.keys()) {
				const stillPending = pendingFiles[idx];
				const sameFile = stillPending && prevPendingFiles[idx]?.file === stillPending.file;
				if (!sameFile) {
					URL.revokeObjectURL(next.get(idx)!);
					next.delete(idx);
					changed = true;
				}
			}
			for (const [idxStr, pending] of Object.entries(pendingFiles)) {
				const idx = Number(idxStr);
				if (!next.has(idx)) {
					next.set(idx, URL.createObjectURL(pending.file));
					changed = true;
				}
			}
			return changed ? next : prev;
		});
	}

	// Revoke whatever's left only on unmount — a ref keeps the cleanup closure off the
	// stale `previews` this effect was set up with, so it never revokes a URL that's
	// still in use by a later render (which a `[previews]` dependency would).
	const previewsRef = useRef(previews);
	useEffect(() => {
		previewsRef.current = previews;
	}, [previews]);
	useEffect(() => {
		return () => {
			previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);

	const addBanner = () => {
		onChange([...value, { image_url: '', media_type: 'image', title: '', subtitle: '', button_label: '', button_link: '', text_align: 'center' }]);
	};

	const removeBanner = (index: number) => {
		onChange(value.filter((_, i) => i !== index));

		const nextPending: Record<number, PendingBannerFile> = {};
		for (const [idxStr, pending] of Object.entries(pendingFiles)) {
			const idx = Number(idxStr);
			if (idx === index) continue;
			nextPending[idx > index ? idx - 1 : idx] = pending;
		}
		onPendingFilesChange(nextPending);
	};

	const updateBanner = (index: number, patch: Partial<TBannerItem>) => {
		onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
	};

	const handleMediaSelect = (index: number, mediaType: TBannerMediaType, files: File[]) => {
		const file = files[0];
		if (!file) return;

		onPendingFilesChange({ ...pendingFiles, [index]: { file, mediaType } });
		updateBanner(index, { media_type: mediaType });
	};

	const clearPendingFile = (index: number) => {
		const next = { ...pendingFiles };
		delete next[index];
		onPendingFilesChange(next);
	};

	return (
		<div className={className}>
			<div className="space-y-4">
				{value.map((banner, index) => {
					const pending = pendingFiles[index];
					const previewUrl = previews.get(index);

					return (
						<div key={index} className="space-y-3 rounded-md border border-input p-4">
							<div className="flex items-center justify-between">
								<span className="text-xs font-medium text-muted-foreground">Banner {index + 1}</span>
								<button
									type="button"
									onClick={() => removeBanner(index)}
									disabled={disabled}
									className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>

							{!banner.image_url && !pending && (
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground">Media type</span>
									<div className="inline-flex rounded-md border border-input overflow-hidden">
										{MEDIA_TYPE_OPTIONS.map(({ value: typeValue, icon: TypeIcon, label }) => (
											<button
												key={typeValue}
												type="button"
												aria-label={label}
												aria-pressed={(banner.media_type ?? 'image') === typeValue}
												disabled={disabled}
												onClick={() => updateBanner(index, { media_type: typeValue })}
												className={cn(
													'flex h-7 items-center gap-1.5 px-2.5 text-xs transition-colors disabled:opacity-50',
													(banner.media_type ?? 'image') === typeValue
														? 'bg-primary text-primary-foreground'
														: 'bg-background hover:bg-accent hover:text-accent-foreground',
												)}
											>
												<TypeIcon className="size-3.5" /> {label}
											</button>
										))}
									</div>
								</div>
							)}

							{banner.image_url ? (
								<div className="relative h-40 w-full">
									<div className="h-40 w-full overflow-hidden rounded-md ring-1 ring-border bg-muted relative">
										{banner.media_type === 'video' ? (
											<video src={banner.image_url} className="h-full w-full object-cover" muted loop controls />
										) : (
											<Image src={banner.image_url} alt={banner.title || 'Banner'} fill className="object-cover" />
										)}
									</div>
									{!disabled && (
										<button
											type="button"
											onClick={() => updateBanner(index, { image_url: '' })}
											className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors"
										>
											<X className="size-3.5" />
										</button>
									)}
								</div>
							) : pending ? (
								<div className="relative h-40 w-full">
									<div className="h-40 w-full overflow-hidden rounded-md ring-1 ring-border bg-muted relative flex items-center justify-center">
										{pending.mediaType === 'video' && previewUrl ? (
											<video src={previewUrl} className="h-full w-full object-cover" muted loop controls />
										) : previewUrl ? (
											// eslint-disable-next-line @next/next/no-img-element -- blob: preview URL, next/image can't optimize it
											<img src={previewUrl} alt={pending.file.name} className="h-full w-full object-cover" />
										) : (
											<div className="flex flex-col items-center gap-1 text-muted-foreground">
												<ImageIcon className="size-6" />
												<span className="text-xs">{pending.file.name}</span>
											</div>
										)}
									</div>
									{!disabled && (
										<button
											type="button"
											onClick={() => clearPendingFile(index)}
											className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors"
										>
											<X className="size-3.5" />
										</button>
									)}
									<span className="absolute bottom-1.5 left-1.5 rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] text-background">
										Pending upload — uploads on Save
									</span>
								</div>
							) : (
								<FileUpload
									compact
									compactShape="rect"
									compactSize={160}
									description={
										banner.media_type === 'video'
											? 'Click to upload banner video (recommended wide/landscape)'
											: 'Click to upload banner image (recommended wide/landscape)'
									}
									accept={banner.media_type === 'video' ? 'video/*' : 'image/*'}
									maxSize={banner.media_type === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE}
									onChange={(files) => handleMediaSelect(index, banner.media_type ?? 'image', files)}
									disabled={disabled}
								/>
							)}

							<Input
								value={banner.title ?? ''}
								onChange={(e) => updateBanner(index, { title: e.target.value })}
								placeholder="Title"
								disabled={disabled}
							/>
							<Input
								value={banner.subtitle ?? ''}
								onChange={(e) => updateBanner(index, { subtitle: e.target.value })}
								placeholder="Subtitle"
								disabled={disabled}
							/>
							<div className="grid grid-cols-2 gap-2">
								<Input
									value={banner.button_label ?? ''}
									onChange={(e) => updateBanner(index, { button_label: e.target.value })}
									placeholder="Button label"
									disabled={disabled}
								/>
								<Input
									value={banner.button_link ?? ''}
									onChange={(e) => updateBanner(index, { button_link: e.target.value })}
									placeholder="Button link"
									disabled={disabled}
								/>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground">Text align</span>
								<div className="inline-flex rounded-md border border-input overflow-hidden">
									{TEXT_ALIGN_OPTIONS.map(({ value: alignValue, icon: AlignIcon, label }) => (
										<button
											key={alignValue}
											type="button"
											aria-label={label}
											aria-pressed={banner.text_align === alignValue}
											disabled={disabled}
											onClick={() => updateBanner(index, { text_align: alignValue })}
											className={cn(
												'flex h-7 w-8 items-center justify-center transition-colors disabled:opacity-50',
												banner.text_align === alignValue
													? 'bg-primary text-primary-foreground'
													: 'bg-background hover:bg-accent hover:text-accent-foreground',
											)}
										>
											<AlignIcon className="size-3.5" />
										</button>
									))}
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<Button type="button" variant="ghost" size="sm" onClick={addBanner} disabled={disabled} className="mt-2 text-primary">
				<Plus className="w-3.5 h-3.5" /> Add Banner
			</Button>
		</div>
	);
}
