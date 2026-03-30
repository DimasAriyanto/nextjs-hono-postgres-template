'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
	const [isAdmin, setIsAdmin] = useState(false);
	const [isDefault, setIsDefault] = useState(false);
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
			setIsAdmin(role.is_admin ?? false);
			setIsDefault(role.is_default ?? false);
		} else {
			setName('');
			setIsAdmin(false);
			setIsDefault(false);
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
				await createMutation.mutateAsync({ name: name.trim(), is_admin: isAdmin, is_default: isDefault });
				toast.success('Role created successfully');
			} else if (role) {
				await updateMutation.mutateAsync({ id: role.id, data: { name: name.trim(), is_admin: isAdmin, is_default: isDefault } });
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
						{mode === 'create' ? 'Add a new role to the system.' : 'Update the role details.'}
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

						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-3">
								<Checkbox
									id="is_admin"
									checked={isAdmin}
									onCheckedChange={(checked) => setIsAdmin(checked === true)}
									disabled={isLoading}
								/>
								<div className="grid gap-0.5">
									<Label htmlFor="is_admin" className="cursor-pointer">Admin role</Label>
									<p className="text-xs text-muted-foreground">Users with this role can access the admin dashboard.</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Checkbox
									id="is_default"
									checked={isDefault}
									onCheckedChange={(checked) => setIsDefault(checked === true)}
									disabled={isLoading}
								/>
								<div className="grid gap-0.5">
									<Label htmlFor="is_default" className="cursor-pointer">Default role</Label>
									<p className="text-xs text-muted-foreground">Automatically assigned to new registered users.</p>
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? mode === 'create' ? 'Creating...' : 'Updating...'
								: mode === 'create' ? 'Create' : 'Update'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
