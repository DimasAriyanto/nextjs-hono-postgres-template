'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useCreateUser, useUpdateUser } from '@/features/user/hooks/use-user';
import { useRoles } from '@/features/role/hooks/use-role';
import { useUploadImage } from '@/features/upload/hooks/use-upload';
import { getErrorMessage, toastMutationError, toastUploadError } from '@/libs/toast';
import type { TUserWithRoles } from '@/contracts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	user?: TUserWithRoles | null;
	mode: 'create' | 'edit';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserFormModal({ isOpen, onClose, user, mode }: UserFormModalProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [roleId, setRoleId] = useState('');
	const [error, setError] = useState('');

	// Avatar state — queued until form is submitted
	const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
	const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);

	const { data: rolesData, isLoading: isLoadingRoles } = useRoles({ limit: 100 });
	const roles = rolesData?.data || [];

	const createMutation = useCreateUser({ onSuccess: () => onClose() });
	const updateMutation = useUpdateUser({ onSuccess: () => onClose() });
	const uploadImageMutation = useUploadImage();

	const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
	if (isOpen !== prevIsOpen) {
		setPrevIsOpen(isOpen);
		if (user && mode === 'edit') {
			setEmail(user.email);
			setName(user.name || '');
			setPassword('');
			const userRoles = user.roles as { id: string }[] | undefined;
			setRoleId(userRoles?.[0]?.id ?? '');
			const existingAvatar = (user as { avatar_url?: string | null }).avatar_url;
			setExistingAvatarUrl(existingAvatar ?? null);
		} else {
			setEmail('');
			setPassword('');
			setName('');
			setRoleId('');
			setExistingAvatarUrl(null);
		}
		setAvatarFiles([]);
		setError('');
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) { setError('Email is required'); return; }
		if (mode === 'create' && !password.trim()) { setError('Password is required'); return; }
		if (mode === 'create' && !roleId) { setError('Role is required'); return; }

		try {
			// Upload avatar if a new file was selected
			let avatarUrl: string | undefined;
			if (avatarFiles[0]) {
				try {
					const res = await uploadImageMutation.mutateAsync({ file: avatarFiles[0], folder: 'avatars' });
					avatarUrl = res.data.url;
				} catch (err) {
					toastUploadError(err, 'avatar');
					return;
				}
			}

			if (mode === 'create') {
				await createMutation.mutateAsync({
					email: email.trim(),
					password: password.trim(),
					name: name.trim() || undefined,
					role_id: roleId,
					...(avatarUrl ? { avatar_url: avatarUrl } : {}),
				});
				toast.success('User created', { description: 'The user has been created successfully.' });
			} else if (user) {
				await updateMutation.mutateAsync({
					id: user.id,
					data: {
						email: email.trim(),
						...(password.trim() && { password: password.trim() }),
						name: name.trim() || undefined,
						role_id: roleId || undefined,
						...(avatarUrl ? { avatar_url: avatarUrl } : {}),
					},
				});
				toast.success('User updated', { description: 'The user has been updated successfully.' });
			}
		} catch (err) {
			setError(getErrorMessage(err));
			toastMutationError(err);
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending;

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
						{/* Avatar picker */}
						<div className="grid gap-2">
							<Label>Avatar</Label>
							{existingAvatarUrl && avatarFiles.length === 0 ? (
								<div className="relative h-16 w-16">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground text-xl font-bold overflow-hidden ring-2 ring-border relative">
										<Image src={existingAvatarUrl} alt="Avatar" fill className="object-cover rounded-full" />
									</div>
									<button
										type="button"
										onClick={() => setExistingAvatarUrl(null)}
										disabled={isLoading}
										className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
									>
										<X className="size-3.5" />
									</button>
								</div>
							) : (
								<FileUpload
									compact
									compactShape="circle"
									compactSize={64}
									accept="image/*"
									maxSize={5 * 1024 * 1024}
									value={avatarFiles}
									onChange={setAvatarFiles}
									disabled={isLoading}
								/>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
								placeholder="Enter name (optional)"
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
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
								onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
								placeholder={mode === 'create' ? 'Enter password' : 'Enter new password'}
								disabled={isLoading}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={roleId}
								onValueChange={(value) => { setRoleId(value); if (error) setError(''); }}
								disabled={isLoading || isLoadingRoles}
							>
								<SelectTrigger>
									<SelectValue placeholder={isLoadingRoles ? 'Loading roles...' : 'Select role'} />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))}
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
