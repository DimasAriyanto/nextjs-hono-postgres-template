'use client';

import { useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import Image from 'next/image';
import { toast } from 'sonner';
import { AlertCircle, ImageIcon, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUploadImage } from '@/features/upload/hooks/use-upload';
import { useCreateGallery, useDeleteGallery, useGalleries } from '@/features/gallery/hooks/use-gallery';
import { toastDeleteError, toastUploadError } from '@/libs/toast';
import type { TGallery } from '@/contracts';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const PAGE_SIZE = 24;

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function GalleryListWrapper() {
	const [keywords, setKeywords] = useQueryState('keywords');
	const [searchInput, setSearchInput] = useState(keywords ?? '');
	const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const { data: galleriesRes, isLoading, isError } = useGalleries({ page, limit: PAGE_SIZE, search: keywords ?? undefined });
	const images = galleriesRes?.data ?? [];
	const total = galleriesRes?.meta?.pagination?.total ?? 0;
	const totalPages = galleriesRes?.meta?.pagination?.totalPages ?? 1;

	const uploadImageMutation = useUploadImage();
	const createGalleryMutation = useCreateGallery();
	const deleteMutation = useDeleteGallery({ onSuccess: () => setDeleteId(null) });

	const isUploading = uploadImageMutation.isPending || createGalleryMutation.isPending;

	const handleFilesSelected = async (files: File[]) => {
		setPendingFiles(files);

		for (const file of files) {
			try {
				const uploadRes = await uploadImageMutation.mutateAsync({ file, folder: 'gallery' });
				await createGalleryMutation.mutateAsync({
					url: uploadRes.data.url,
					path: uploadRes.data.path,
					filename: file.name,
					size: file.size,
					mime_type: file.type,
				});
			} catch (err) {
				toastUploadError(err, file.name);
			}
		}

		setPendingFiles([]);
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setKeywords(searchInput || null);
		setPage(1);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteId) return;
		try {
			await deleteMutation.mutateAsync(deleteId);
			toast.success('Image deleted', { description: 'The image has been removed from the gallery.' });
		} catch {
			toastDeleteError('image');
		}
	};

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ label: 'Dashboard', href: '/gundala-admin/d' },
					{ label: 'Content Management' },
					{ label: 'Gallery' },
				]}
				title="Gallery"
				description="Upload and manage reusable images for landing pages and other content."
			/>

			<div className="space-y-4">
				<FileUpload
					multiple
					accept="image/*"
					maxSize={MAX_IMAGE_SIZE}
					value={pendingFiles}
					onChange={handleFilesSelected}
					disabled={isUploading}
					description={isUploading ? 'Uploading...' : undefined}
				/>

				<form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
					<Input
						placeholder="Search by filename..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="h-9 w-full sm:w-[260px]"
					/>
					<Button type="submit" size="sm" variant="outline">Search</Button>
				</form>

				{isLoading ? (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{Array.from({ length: 12 }).map((_, i) => (
							<Skeleton key={i} className="aspect-square w-full rounded-md" />
						))}
					</div>
				) : isError ? (
					<EmptyState
						icon={<AlertCircle className="size-5" />}
						title="Failed to load gallery"
						description="An error occurred while loading images. Please try again."
					/>
				) : images.length === 0 ? (
					<EmptyState
						icon={<ImageIcon className="size-5" />}
						title="No images yet"
						description="Upload images above to start building your gallery."
					/>
				) : (
					<>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
							{images.map((image) => (
								<GalleryItem key={image.id} image={image} onDelete={() => setDeleteId(image.id)} />
							))}
						</div>

						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">{total} image{total === 1 ? '' : 's'}</p>
							<div className="flex items-center gap-2">
								<Button type="button" size="sm" variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
									Previous
								</Button>
								<span className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</span>
								<Button type="button" size="sm" variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
									Next
								</Button>
							</div>
						</div>
					</>
				)}
			</div>

			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Image</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this image? This action cannot be undone and the file will be removed from storage.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700">
							{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function GalleryItem({ image, onDelete }: { image: TGallery; onDelete: () => void }) {
	return (
		<div className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
			<Image src={image.url} alt={image.alt_text || image.filename} fill className="object-cover" />
			<button
				type="button"
				onClick={onDelete}
				aria-label="Delete image"
				className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity hover:bg-foreground group-hover:opacity-100"
			>
				<Trash2 className="size-3.5" />
			</button>
			<div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
				{image.filename} · {formatBytes(image.size)}
			</div>
		</div>
	);
}
