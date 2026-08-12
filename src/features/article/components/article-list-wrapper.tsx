'use client';

import { useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { ExportButton } from '@/components/export-button';
import { createArticleColumns } from './article-columns';
import { ArticleFormModal } from './article-form-modal';
import { PageHeader } from '@/components/page-header';
import { useArticles, useDeleteArticle, useUpdateArticle } from '@/features/article/hooks/use-article';
import { getArticles } from '@/features/article/apis/article.api';
import { toast } from 'sonner';
import { format } from 'date-fns';
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
import type { TArticleStatus, TArticleWithAuthor } from '@/contracts';

const ARTICLE_STATUS_OPTIONS = [
	{ label: 'Draft', value: 'draft' },
	{ label: 'Published', value: 'published' },
];

export function ArticleListWrapper() {
	const [showModal, setShowModal] = useState(false);
	const [editingArticle, setEditingArticle] = useState<TArticleWithAuthor | null>(null);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [toggleArticle, setToggleArticle] = useState<TArticleWithAuthor | null>(null);
	const [keywords] = useQueryState('keywords');
	const [page] = useQueryState('page', parseAsInteger.withDefault(1));
	const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
	const [status] = useQueryState('status');

	const { data: articlesData, isLoading, isError } = useArticles({
		page,
		limit,
		search: keywords ?? undefined,
		status: (status as TArticleStatus) ?? undefined,
	});
	const articles = articlesData?.data || [];
	const total = articlesData?.meta?.pagination?.total ?? 0;

	const deleteMutation = useDeleteArticle({
		onSuccess: () => setDeleteId(null),
	});

	const updateMutation = useUpdateArticle({
		onSuccess: () => setToggleArticle(null),
	});

	const handleEdit = (article: TArticleWithAuthor) => {
		setEditingArticle(article);
		setModalMode('edit');
		setShowModal(true);
	};

	const handleCreate = () => {
		setEditingArticle(null);
		setModalMode('create');
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingArticle(null);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteId) return;
		try {
			await deleteMutation.mutateAsync(deleteId);
			toast.success('Article deleted', { description: 'The article has been deleted successfully.' });
		} catch {
			toast.error('Delete failed', { description: 'Failed to delete the article. Please try again.' });
		}
	};

	const handleToggleStatusConfirm = async () => {
		if (!toggleArticle) return;
		const nextStatus: TArticleStatus = toggleArticle.status === 'published' ? 'draft' : 'published';
		try {
			await updateMutation.mutateAsync({ id: toggleArticle.id, data: { status: nextStatus } });
			toast.success(nextStatus === 'published' ? 'Article published' : 'Article set to draft', {
				description: nextStatus === 'published'
					? 'The article is now visible to the public.'
					: 'The article has been set back to draft.',
			});
		} catch {
			toast.error('Update failed', { description: 'Failed to update article status. Please try again.' });
		}
	};

	const columns = createArticleColumns({
		onEdit: handleEdit,
		onDelete: (id) => setDeleteId(id),
		onToggleStatus: (article) => setToggleArticle(article),
		togglingId: updateMutation.isPending ? toggleArticle?.id : null,
		page,
		limit,
	});

	const ArticleFilter = () => (
		<DataTableFacetedFilter paramName="status" title="Status" options={ARTICLE_STATUS_OPTIONS} />
	);

	const CreateButton = () => (
		<Button onClick={handleCreate} size="sm">
			<Plus className="w-4 h-4 mr-2" />
			Add Article
		</Button>
	);

	const ArticleExportButton = () => (
		<ExportButton
			filename={`articles-${format(new Date(), 'yyyy-MM-dd')}`}
			title="Article List"
			onFetchData={async () => {
				const res = await getArticles({ page: 1, limit: 10000, search: keywords ?? undefined });
				return (res.data ?? []).map((a) => ({
					'Title': a.title,
					'Slug': a.slug,
					'Status': a.status,
					'Author': (a.author as { name?: string; email?: string } | null | undefined)?.name ?? (a.author as { email?: string } | null | undefined)?.email ?? '-',
					'Created At': a.created_at,
				}));
			}}
		/>
	);

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ label: 'Dashboard', href: '/gundala-admin/d' },
					{ label: 'Content Management' },
					{ label: 'Article' },
				]}
				title="Articles"
				description="Manage blog articles for your application."
			/>

			<DataTable
				columns={columns}
				data={articles}
				meta={{ limit, total }}
				FilterComp={ArticleFilter}
				CreateComp={CreateButton}
				ExportComp={ArticleExportButton}
				isError={isError}
				isLoading={isLoading}
			/>

			<ArticleFormModal isOpen={showModal} onClose={handleCloseModal} article={editingArticle} mode={modalMode} />

			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Article</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this article? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							disabled={deleteMutation.isPending}
							className="bg-red-600 hover:bg-red-700"
						>
							{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={!!toggleArticle} onOpenChange={(open) => !open && setToggleArticle(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{toggleArticle?.status === 'published' ? 'Set Article to Draft' : 'Publish Article'}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{toggleArticle?.status === 'published'
								? `Are you sure you want to set "${toggleArticle?.title}" back to draft? It will no longer be visible to the public.`
								: `Are you sure you want to publish "${toggleArticle?.title}"? It will become visible to the public.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={updateMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleToggleStatusConfirm} disabled={updateMutation.isPending}>
							{updateMutation.isPending
								? 'Saving...'
								: toggleArticle?.status === 'published'
									? 'Set to Draft'
									: 'Publish'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
