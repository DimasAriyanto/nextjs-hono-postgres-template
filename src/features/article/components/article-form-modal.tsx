'use client';

import { useState, useEffect, useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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
import { slugify } from '@/libs/string';
import { ApiError } from '@/libs/api';
import type { TArticleStatus, TArticleWithAuthor } from '@/contracts';

// ─── Upload helper ─────────────────────────────────────────────────────────────

async function uploadThumbnail(file: File): Promise<string> {
	const fd = new FormData();
	fd.append('file', file);
	fd.append('folder', 'articles');
	const res = await fetch('/api/v1/uploads/image', { method: 'POST', body: fd });
	if (!res.ok) {
		const json = await res.json() as { message?: string };
		throw new Error(json.message ?? 'Failed to upload thumbnail');
	}
	const json = await res.json() as { data: { url: string } };
	return json.data.url;
}

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
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
	const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
	const thumbnailInputRef = useRef<HTMLInputElement>(null);

	const createMutation = useCreateArticle({ onSuccess: () => onClose() });
	const updateMutation = useUpdateArticle({ onSuccess: () => onClose() });

	useEffect(() => {
		if (article && mode === 'edit') {
			setTitle(article.title);
			setSlug(article.slug);
			setSlugTouched(true);
			setExcerpt(article.excerpt || '');
			setContent(article.content);
			setStatus(article.status);
			setThumbnailPreview(article.thumbnail_url || null);
		} else {
			setTitle('');
			setSlug('');
			setSlugTouched(false);
			setExcerpt('');
			setContent('');
			setStatus('draft');
			setThumbnailPreview(null);
		}
		setThumbnailFile(null);
		setError('');
	}, [article, mode, isOpen]);

	const handleTitleChange = (value: string) => {
		setTitle(value);
		if (!slugTouched) setSlug(slugify(value));
		if (error) setError('');
	};

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Invalid file', { description: 'Please select an image file' });
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error('File too large', { description: 'Image must be less than 5 MB' });
			return;
		}

		setThumbnailFile(file);
		const reader = new FileReader();
		reader.onloadend = () => setThumbnailPreview(reader.result as string);
		reader.readAsDataURL(file);
		e.target.value = '';
	};

	const handleRemoveThumbnail = () => {
		setThumbnailFile(null);
		setThumbnailPreview(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title.trim()) { setError('Title is required'); return; }
		if (!content.trim()) { setError('Content is required'); return; }

		try {
			let thumbnailUrl: string | undefined;
			if (thumbnailFile) {
				setIsUploadingThumbnail(true);
				try {
					thumbnailUrl = await uploadThumbnail(thumbnailFile);
				} catch (err) {
					toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Failed to upload thumbnail' });
					setIsUploadingThumbnail(false);
					return;
				}
				setIsUploadingThumbnail(false);
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
				toast.success('Article created successfully');
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
				toast.success('Article updated successfully');
			}
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
				toast.error('Failed', { description: err.message });
			} else {
				setError('An error occurred');
				toast.error('An error occurred');
			}
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending || isUploadingThumbnail;

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
							{thumbnailPreview ? (
								<div className="relative h-40 w-full overflow-hidden rounded-md ring-1 ring-border">
									<Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
									<button
										type="button"
										onClick={handleRemoveThumbnail}
										disabled={isLoading}
										className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
									>
										<X className="size-4" />
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => thumbnailInputRef.current?.click()}
									disabled={isLoading}
									className="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
								>
									{isUploadingThumbnail ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
									<span className="text-xs">Click to upload image</span>
								</button>
							)}
							<input
								ref={thumbnailInputRef}
								type="file"
								accept="image/*"
								className="sr-only"
								onChange={handleThumbnailChange}
							/>
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
								? <><Loader2 className="size-4 mr-1.5 animate-spin" />{isUploadingThumbnail ? 'Uploading...' : mode === 'create' ? 'Creating...' : 'Updating...'}</>
								: mode === 'create' ? 'Create' : 'Update'
							}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
