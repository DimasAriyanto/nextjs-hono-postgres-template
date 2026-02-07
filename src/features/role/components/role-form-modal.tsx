'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useCreateRole, useUpdateRole } from '@/features/role/hooks/use-role';
import { ApiError } from '@/libs/api';
import { toast } from 'sonner';
import type { TRole } from '@/contracts';

interface RoleFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	role?: TRole | null;
	mode: 'create' | 'edit';
}

export function RoleFormModal({ isOpen, onClose, role, mode }: RoleFormModalProps) {
	const [name, setName] = useState('');
	const [error, setError] = useState('');

	const createMutation = useCreateRole({
		onSuccess: () => onClose(),
	});

	const updateMutation = useUpdateRole({
		onSuccess: () => onClose(),
	});

	useEffect(() => {
		if (role && mode === 'edit') {
			setName(role.name);
		} else {
			setName('');
		}
		setError('');
	}, [role, mode, isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			setError('Name is required');
			return;
		}

		try {
			if (mode === 'create') {
				await createMutation.mutateAsync({ name: name.trim() });
				toast.success('Role created successfully');
			} else if (role) {
				await updateMutation.mutateAsync({ id: role.id, data: { name: name.trim() } });
				toast.success('Role updated successfully');
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

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{mode === 'create' ? 'Create Role' : 'Edit Role'}</DialogTitle>
					<DialogDescription>
						{mode === 'create' ? 'Add a new role to the system.' : 'Update the role name.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (error) setError('');
								}}
								placeholder="Enter role name"
								disabled={isLoading}
							/>
							{error && <p className="text-sm text-red-500">{error}</p>}
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (mode === 'create' ? 'Creating...' : 'Updating...') : mode === 'create' ? 'Create' : 'Update'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
