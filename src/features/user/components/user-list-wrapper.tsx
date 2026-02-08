'use client';

import { useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { createUserColumns } from './user-columns';
import { UserFormModal } from './user-form-modal';
import { PageHeader } from '@/components/page-header';
import { useUsers, useDeleteUser } from '@/features/user/hooks/use-user';
import { toast } from 'sonner';
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
import type { TUserWithRoles } from '@/contracts';

export function UserListWrapper() {
	const [showModal, setShowModal] = useState(false);
	const [editingUser, setEditingUser] = useState<TUserWithRoles | null>(null);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [keywords] = useQueryState('keywords');
	const [page] = useQueryState('page', parseAsInteger.withDefault(1));
	const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));

	const { data: usersData, isLoading, isError } = useUsers({
		page,
		limit,
		search: keywords ?? undefined,
	});
	const users = usersData?.data || [];
	const total = usersData?.meta?.pagination?.total ?? 0;

	const deleteMutation = useDeleteUser({
		onSuccess: () => setDeleteId(null),
	});

	const handleEdit = (user: TUserWithRoles) => {
		setEditingUser(user);
		setModalMode('edit');
		setShowModal(true);
	};

	const handleCreate = () => {
		setEditingUser(null);
		setModalMode('create');
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingUser(null);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteId) return;
		try {
			await deleteMutation.mutateAsync(deleteId);
			toast.success('User deleted successfully');
		} catch {
			toast.error('Failed to delete user');
		}
	};

	const columns = createUserColumns({
		onEdit: handleEdit,
		onDelete: (id) => setDeleteId(id),
	});

	const CreateButton = () => (
		<Button onClick={handleCreate} size="sm">
			<Plus className="w-4 h-4 mr-2" />
			Add User
		</Button>
	);

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ label: 'Dashboard', href: '/gundala-admin/d' },
					{ label: 'User Management' },
					{ label: 'User' },
				]}
				title="Users"
				description="Manage users for your application."
			/>

			<DataTable
				columns={columns}
				data={users}
				meta={{ limit, total }}
				CreateComp={CreateButton}
				isError={isError}
				isLoading={isLoading}
			/>

			<UserFormModal isOpen={showModal} onClose={handleCloseModal} user={editingUser} mode={modalMode} />

			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this user? This action cannot be undone.
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
