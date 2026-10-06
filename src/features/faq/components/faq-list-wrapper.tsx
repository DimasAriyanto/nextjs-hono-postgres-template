'use client';

import { useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { createFaqColumns } from './faq-columns';
import { FaqFormModal } from './faq-form-modal';
import { PageHeader } from '@/components/page-header';
import { useFaqs, useDeleteFaq } from '@/features/faq/hooks/use-faq';
import { ContentLocaleSwitcher } from '@/features/setting/components/tabs/content-locale-switcher';
import { toast } from 'sonner';
import { toastDeleteError } from '@/libs/toast';
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
import { DEFAULT_CONTENT_LOCALE, type TContentLocale, type TFaq } from '@/contracts';

export function FaqListWrapper() {
	const [showModal, setShowModal] = useState(false);
	const [editingFaq, setEditingFaq] = useState<TFaq | null>(null);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [locale, setLocale] = useState<TContentLocale>(DEFAULT_CONTENT_LOCALE);
	const [keywords] = useQueryState('keywords');
	const [page] = useQueryState('page', parseAsInteger.withDefault(1));
	const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));

	const { data: faqsData, isLoading, isError } = useFaqs({
		page,
		limit,
		search: keywords ?? undefined,
		locale,
	});
	const faqs = faqsData?.data || [];
	const total = faqsData?.meta?.pagination?.total ?? 0;

	const deleteMutation = useDeleteFaq({
		onSuccess: () => setDeleteId(null),
	});

	const handleEdit = (faq: TFaq) => {
		setEditingFaq(faq);
		setModalMode('edit');
		setShowModal(true);
	};

	const handleCreate = () => {
		setEditingFaq(null);
		setModalMode('create');
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingFaq(null);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteId) return;
		try {
			await deleteMutation.mutateAsync(deleteId);
			toast.success('FAQ deleted', { description: 'The FAQ item has been deleted successfully.' });
		} catch {
			toastDeleteError('FAQ');
		}
	};

	const columns = createFaqColumns({
		onEdit: handleEdit,
		onDelete: (id) => setDeleteId(id),
		page,
		limit,
	});

	const CreateButton = () => (
		<Button onClick={handleCreate} size="sm">
			<Plus className="w-4 h-4 mr-2" />
			Add FAQ
		</Button>
	);

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ label: 'Dashboard', href: '/gundala-admin/d' },
					{ label: 'Content Management' },
					{ label: 'FAQ' },
				]}
				title="FAQ"
				description="Manage frequently asked questions shown on the landing page."
			/>

			<ContentLocaleSwitcher value={locale} onChange={setLocale} />

			<DataTable
				columns={columns}
				data={faqs}
				meta={{ limit, total }}
				CreateComp={CreateButton}
				isError={isError}
				isLoading={isLoading}
			/>

			<FaqFormModal isOpen={showModal} onClose={handleCloseModal} faq={editingFaq} mode={modalMode} locale={locale} />

			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete FAQ</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this FAQ item? This action cannot be undone.
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
		</>
	);
}
