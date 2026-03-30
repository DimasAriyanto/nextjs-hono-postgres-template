'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useCreateUser, useUpdateUser } from '@/features/user/hooks/use-user';
import { useRoles } from '@/features/role/hooks/use-role';
import { ApiError } from '@/libs/api';
import type { TUserWithRoles } from '@/contracts';

// ─── Upload helper ─────────────────────────────────────────────────────────────

async function uploadAvatar(file: File): Promise<string> {
	const fd = new FormData();
	fd.append('file', file);
	fd.append('folder', 'avatars');
	const res = await fetch('/api/v1/uploads/image', { method: 'POST', body: fd });
	if (!res.ok) {
		const json = await res.json() as { message?: string };
		throw new Error(json.message ?? 'Failed to upload avatar');
	}
	const json = await res.json() as { data: { url: string } };
	return json.data.url;
}

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
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const avatarInputRef = useRef<HTMLInputElement>(null);

	const { data: rolesData } = useRoles({ limit: 100 });
	const roles = rolesData?.data || [];

	const createMutation = useCreateUser({ onSuccess: () => onClose() });
	const updateMutation = useUpdateUser({ onSuccess: () => onClose() });

	useEffect(() => {
		if (user && mode === 'edit') {
			setEmail(user.email);
			setName(user.name || '');
			setPassword('');
			const userRoles = user.roles as { id: string }[] | undefined;
			setRoleId(userRoles?.[0]?.id ?? '');
			const existingAvatar = (user as { avatar_url?: string | null }).avatar_url;
			setAvatarPreview(existingAvatar ?? null);
		} else {
			setEmail('');
			setPassword('');
			setName('');
			setRoleId('');
			setAvatarPreview(null);
		}
		setAvatarFile(null);
		setError('');
	}, [user, mode, isOpen]);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

		setAvatarFile(file);
		const reader = new FileReader();
		reader.onloadend = () => setAvatarPreview(reader.result as string);
		reader.readAsDataURL(file);
		e.target.value = '';
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) { setError('Email is required'); return; }
		if (mode === 'create' && !password.trim()) { setError('Password is required'); return; }

		try {
			// Upload avatar if a new file was selected
			let avatarUrl: string | undefined;
			if (avatarFile) {
				setIsUploadingAvatar(true);
				try {
					avatarUrl = await uploadAvatar(avatarFile);
				} catch (err) {
					toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Failed to upload avatar' });
					setIsUploadingAvatar(false);
					return;
				}
				setIsUploadingAvatar(false);
			}

			if (mode === 'create') {
				await createMutation.mutateAsync({
					email: email.trim(),
					password: password.trim(),
					name: name.trim() || undefined,
					role_id: roleId || undefined,
					...(avatarUrl ? { avatar_url: avatarUrl } : {}),
				});
				toast.success('User created successfully');
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

	const initials = name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
	const isLoading = createMutation.isPending || updateMutation.isPending || isUploadingAvatar;

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
						<div className="flex flex-col items-center gap-2">
							<div className="relative">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground text-xl font-bold overflow-hidden ring-2 ring-border">
									{avatarPreview ? (
										<Image src={avatarPreview} alt="Avatar" fill className="object-cover rounded-full" />
									) : (
										initials || <User className="size-6" />
									)}
								</div>
								<button
									type="button"
									onClick={() => avatarInputRef.current?.click()}
									disabled={isLoading}
									className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
								>
									{isUploadingAvatar ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />}
								</button>
								<input
									ref={avatarInputRef}
									type="file"
									accept="image/*"
									className="sr-only"
									onChange={handleAvatarChange}
								/>
							</div>
							{avatarFile && !isUploadingAvatar && (
								<p className="text-xs text-muted-foreground">New photo selected — will be uploaded on save</p>
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
								disabled={isLoading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select role (optional)" />
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
								? <><Loader2 className="size-4 mr-1.5 animate-spin" />{isUploadingAvatar ? 'Uploading...' : mode === 'create' ? 'Creating...' : 'Updating...'}</>
								: mode === 'create' ? 'Create' : 'Update'
							}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
