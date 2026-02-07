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
import { useCreateUser, useUpdateUser } from '@/features/user/hooks/use-user';
import { ApiError } from '@/libs/api';
import { toast } from 'sonner';
import type { TUser } from '@/contracts';

interface UserFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	user?: TUser | null;
	mode: 'create' | 'edit';
}

export function UserFormModal({ isOpen, onClose, user, mode }: UserFormModalProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [error, setError] = useState('');

	const createMutation = useCreateUser({
		onSuccess: () => onClose(),
	});

	const updateMutation = useUpdateUser({
		onSuccess: () => onClose(),
	});

	useEffect(() => {
		if (user && mode === 'edit') {
			setEmail(user.email);
			setName(user.name || '');
			setPassword('');
		} else {
			setEmail('');
			setPassword('');
			setName('');
		}
		setError('');
	}, [user, mode, isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			setError('Email is required');
			return;
		}

		if (mode === 'create' && !password.trim()) {
			setError('Password is required');
			return;
		}

		try {
			if (mode === 'create') {
				await createMutation.mutateAsync({
					email: email.trim(),
					password: password.trim(),
					name: name.trim() || undefined,
				});
				toast.success('User created successfully');
			} else if (user) {
				await updateMutation.mutateAsync({
					id: user.id,
					data: {
						email: email.trim(),
						...(password.trim() && { password: password.trim() }),
						name: name.trim() || undefined,
					},
				});
				toast.success('User updated successfully');
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
					<DialogTitle>{mode === 'create' ? 'Create User' : 'Edit User'}</DialogTitle>
					<DialogDescription>
						{mode === 'create' ? 'Add a new user to the system.' : 'Update user information.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									if (error) setError('');
								}}
								placeholder="Enter email"
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">
								Password {mode === 'edit' && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									if (error) setError('');
								}}
								placeholder={mode === 'create' ? 'Enter password' : 'Enter new password'}
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (error) setError('');
								}}
								placeholder="Enter title (optional)"
								disabled={isLoading}
							/>
						</div>
						{error && <p className="text-sm text-red-500">{error}</p>}
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
