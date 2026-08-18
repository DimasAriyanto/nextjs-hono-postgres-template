'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FileUpload } from '@/components/ui/file-upload';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useCreateArticle, useUpdateArticle } from '@/features/article/hooks/use-article';
import { useUploadImage } from '@/features/upload/hooks/use-upload';
import { slugify } from '@/libs/string';
import { ApiError } from '@/libs/api';
import type { TArticleStatus, TArticleWithAuthor } from '@/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArticleFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	article?: TArticleWithAuthor | null;
	mode: 'create' | 'edit';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArticleFormModal({ isOpen, onClose, article, mode }: ArticleFormModalProps) {
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [slugTouched, setSlugTouched] = useState(false);
	const [excerpt, setExcerpt] = useState('');
	const [content, setContent] = useState('');
	const [status, setStatus] = useState<TArticleStatus>('draft');
	const [error, setError] = useState('');

	// Thumbnail state — queued until form is submitted
	const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
	const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

	const createMutation = useCreateArticle({ onSuccess: () => onClose() });
	const updateMutation = useUpdateArticle({ onSuccess: () => onClose() });
	const uploadImageMutation = useUploadImage();

	const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
	if (isOpen !== prevIsOpen) {
		setPrevIsOpen(isOpen);
		if (article && mode === 'edit') {
			setTitle(article.title);
			setSlug(article.slug);
			setSlugTouched(true);
			setExcerpt(article.excerpt || '');
			setContent(article.content);
			setStatus(article.status);
			setExistingThumbnailUrl(article.thumbnail_url || null);
		} else {
			setTitle('');
			setSlug('');
			setSlugTouched(false);
			setExcerpt('');
			setContent('');
			setStatus('draft');
			setExistingThumbnailUrl(null);
		}
		setThumbnailFiles([]);
		setError('');
	}

	const handleTitleChange = (value: string) => {
		setTitle(value);
		if (!slugTouched) setSlug(slugify(value));
		if (error) setError('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) { setError('Title is required'); return; }
		if (!content.trim()) { setError('Content is required'); return; }

		try {
			let thumbnailUrl: string | undefined;
			if (thumbnailFiles[0]) {
				try {
					const res = await uploadImageMutation.mutateAsync({ file: thumbnailFiles[0], folder: 'articles' });
					thumbnailUrl = res.data.url;
				} catch (err) {
					toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Failed to upload thumbnail' });
					return;
				}
			}

			if (mode === 'create') {
				await createMutation.mutateAsync({
					title: title.trim(),
					slug: slug.trim() || undefined,
					excerpt: excerpt.trim() || undefined,
					content,
					status,
					...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
				});
				toast.success('Article created', { description: 'The article has been created successfully.' });
			} else if (article) {
				await updateMutation.mutateAsync({
					id: article.id,
					data: {
						title: title.trim(),
						slug: slug.trim() || undefined,
						excerpt: excerpt.trim() || undefined,
						content,
						status,
						...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
					},
				});
				toast.success('Article updated', { description: 'The article has been updated successfully.' });
			}
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
				toast.error('Failed', { description: err.message });
			} else {
				setError('An error occurred');
				toast.error('Something went wrong', { description: 'An error occurred. Please try again.' });
			}
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'Create Article' : 'Edit Article'}</DialogTitle>
					<DialogDescription>
						{mode === 'create' ? 'Publish a new article or blog post.' : 'Update article information.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						{/* Thumbnail picker */}
						<div className="grid gap-2">
							<Label>Thumbnail</Label>
							{existingThumbnailUrl && thumbnailFiles.length === 0 && (
								<div className="relative h-40 w-full overflow-hidden rounded-md ring-1 ring-border">
									<Image src={existingThumbnailUrl} alt="Thumbnail" fill className="object-cover" />
									<button
										type="button"
										onClick={() => setExistingThumbnailUrl(null)}
										disabled={isLoading}
										className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
									>
										<X className="size-4" />
									</button>
								</div>
							)}
							{(!existingThumbnailUrl || thumbnailFiles.length > 0) && (
								<FileUpload
									compact
									compactShape="rect"
									compactSize={160}
									accept="image/*"
									maxSize={5 * 1024 * 1024}
									value={thumbnailFiles}
									onChange={setThumbnailFiles}
									disabled={isLoading}
									description="Drag & drop or click to upload an image"
								/>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => handleTitleChange(e.target.value)}
								placeholder="Enter article title"
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="slug">Slug</Label>
							<Input
								id="slug"
								value={slug}
								onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); if (error) setError(''); }}
								placeholder="article-slug"
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="excerpt">Excerpt</Label>
							<Textarea
								id="excerpt"
								value={excerpt}
								onChange={(e) => { setExcerpt(e.target.value); if (error) setError(''); }}
								placeholder="Short summary shown on listing pages (optional)"
								disabled={isLoading}
								rows={2}
							/>
						</div>
						<div className="grid gap-2">
							<Label>Content</Label>
							<RichTextEditor content={content} onChange={(value) => { setContent(value); if (error) setError(''); }} placeholder="Write the article content..." />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={status}
								onValueChange={(value) => setStatus(value as TArticleStatus)}
								disabled={isLoading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="published">Published</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{error && <p className="text-sm text-red-500">{error}</p>}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? <><Loader2 className="size-4 mr-1.5 animate-spin" />{uploadImageMutation.isPending ? 'Uploading...' : mode === 'create' ? 'Creating...' : 'Updating...'}</>
								: mode === 'create' ? 'Create' : 'Update'
							}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
