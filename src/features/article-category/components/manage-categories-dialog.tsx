'use client';

import { useState } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
	useArticleCategories,
	useCreateArticleCategory,
	useUpdateArticleCategory,
	useDeleteArticleCategory,
} from '@/features/article-category/hooks/use-article-category';
import { toastMutationError, toastDeleteError } from '@/libs/toast';
import type { TArticleCategory } from '@/contracts';

interface ManageCategoriesDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ManageCategoriesDialog({ isOpen, onClose }: ManageCategoriesDialogProps) {
	const [newName, setNewName] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState('');
	const [deleteTarget, setDeleteTarget] = useState<TArticleCategory | null>(null);

	const { data: categoriesRes, isLoading } = useArticleCategories();
	const categories = categoriesRes?.data ?? [];

	const createMutation = useCreateArticleCategory({ onSuccess: () => setNewName('') });
	const updateMutation = useUpdateArticleCategory({ onSuccess: () => setEditingId(null) });
	const deleteMutation = useDeleteArticleCategory({ onSuccess: () => setDeleteTarget(null) });

	const handleCreate = async () => {
		if (!newName.trim()) return;
		try {
			await createMutation.mutateAsync({ name: newName.trim() });
			toast.success('Category created');
		} catch (err) {
			toastMutationError(err);
		}
	};

	const startEdit = (category: TArticleCategory) => {
		setEditingId(category.id);
		setEditingName(category.name);
	};

	const handleUpdate = async (id: string) => {
		if (!editingName.trim()) return;
		try {
			await updateMutation.mutateAsync({ id, data: { name: editingName.trim() } });
			toast.success('Category updated');
		} catch (err) {
			toastMutationError(err);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await deleteMutation.mutateAsync(deleteTarget.id);
			toast.success('Category deleted');
		} catch {
			toastDeleteError('category');
		}
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle>Manage Categories</DialogTitle>
						<DialogDescription>Add, rename or remove article categories.</DialogDescription>
					</DialogHeader>

					<div className="flex items-center gap-2">
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreate())}
							placeholder="New category name"
							disabled={createMutation.isPending}
						/>
						<Button type="button" size="sm" onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()}>
							{createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
						</Button>
					</div>

					<div className="max-h-72 space-y-1 overflow-y-auto">
						{isLoading && (
							<>
								<Skeleton className="h-9 w-full" />
								<Skeleton className="h-9 w-full" />
							</>
						)}

						{!isLoading && categories.length === 0 && (
							<p className="py-6 text-center text-sm text-muted-foreground">No categories yet.</p>
						)}

						{categories.map((category) => (
							<div key={category.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
								{editingId === category.id ? (
									<>
										<Input
											value={editingName}
											onChange={(e) => setEditingName(e.target.value)}
											onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdate(category.id))}
											className="h-8"
											autoFocus
										/>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleUpdate(category.id)} disabled={updateMutation.isPending}>
											<Check className="size-4" />
										</Button>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>
											<X className="size-4" />
										</Button>
									</>
								) : (
									<>
										<span className="flex-1 truncate text-sm">{category.name}</span>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(category)} title="Rename">
											<Pencil className="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
											onClick={() => setDeleteTarget(category)}
											title="Delete"
										>
											<Trash2 className="size-3.5" />
										</Button>
									</>
								)}
							</div>
						))}
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Category</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? Articles using this category will become uncategorized.
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
