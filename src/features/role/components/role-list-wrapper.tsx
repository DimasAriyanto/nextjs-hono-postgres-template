'use client';

import { useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { createRoleColumns } from './role-columns';
import { RoleFormModal } from './role-form-modal';
import { PageHeader } from '@/components/page-header';
import { useRoles, useDeleteRole } from '@/features/role/hooks/use-role';
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
import type { TRole } from '@/contracts';

export function RoleListWrapper() {
	const [showModal, setShowModal] = useState(false);
	const [editingRole, setEditingRole] = useState<TRole | null>(null);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [keywords] = useQueryState('keywords');
	const [page] = useQueryState('page', parseAsInteger.withDefault(1));
	const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));

	const { data: rolesData, isLoading, isError } = useRoles({
		page,
		limit,
		search: keywords ?? undefined,
	});
	const roles = rolesData?.data || [];
	const total = rolesData?.meta?.pagination?.total ?? 0;

	const deleteMutation = useDeleteRole({
		onSuccess: () => setDeleteId(null),
	});

	const handleEdit = (role: TRole) => {
		setEditingRole(role);
		setModalMode('edit');
		setShowModal(true);
	};

	const handleCreate = () => {
		setEditingRole(null);
		setModalMode('create');
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingRole(null);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteId) return;
		await deleteMutation.mutateAsync(deleteId);
	};

	const columns = createRoleColumns({
		onEdit: handleEdit,
		onDelete: (id) => setDeleteId(id),
	});

	const CreateButton = () => (
		<Button onClick={handleCreate} size="sm">
			<Plus className="w-4 h-4 mr-2" />
			Add Role
		</Button>
	);

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ label: 'Dashboard', href: '/gundala-admin/d' },
					{ label: 'User Management' },
					{ label: 'Role' },
				]}
				title="Roles"
				description="Manage roles and permissions for your application."
			/>

			<DataTable
				columns={columns}
				data={roles}
				meta={{ limit, total }}
				CreateComp={CreateButton}
				isError={isError}
				isLoading={isLoading}
			/>

			<RoleFormModal isOpen={showModal} onClose={handleCloseModal} role={editingRole} mode={modalMode} />

			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Role</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this role? This action cannot be undone.
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
