'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	User, Mail, Shield, Key, Pencil, Check, X, BadgeCheck, Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { useProfile, useUpdateProfile, useChangePassword, useResendVerification } from '@/features/auth/hooks/use-auth';
import { useUploadImage } from '@/features/upload/hooks/use-upload';
import { toastUploadError } from '@/libs/toast';
import { formatTZ } from '@/libs/dayjs';
import { changePasswordSchema } from '@/contracts';

// ─── Local schemas ─────────────────────────────────────────────────────────────

const profileEditSchema = z.object({
	name: z.string().min(1, 'Name is required'),
});

type TProfileEdit = z.infer<typeof profileEditSchema>;
type TChangePassword = z.infer<typeof changePasswordSchema>;

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex flex-col gap-0.5">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="text-sm font-medium">{value || <span className="text-muted-foreground/60 italic">—</span>}</p>
		</div>
	);
}

function ProfileSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Skeleton className="h-14 w-14 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-5 w-36" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
			<Skeleton className="h-px w-full" />
			{[1, 2].map((i) => (
				<Card key={i} className="border-muted/50">
					<CardContent className="p-6 space-y-4">
						<Skeleton className="h-4 w-28" />
						<div className="grid grid-cols-2 gap-4">
							{[1, 2].map((j) => <Skeleton key={j} className="h-10" />)}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AccountSettingWrapper() {
	const [editingProfile, setEditingProfile] = useState(false);
	const [editingPassword, setEditingPassword] = useState(false);

	// Avatar state — file queued until Save is clicked
	const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
	const [replacingAvatar, setReplacingAvatar] = useState(false);

	const { data: profileRes, isLoading } = useProfile();
	const user = profileRes?.data;

	const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile();
	const { mutate: changePassword, isPending: changingPassword } = useChangePassword();
	const { mutate: resendVerification, isPending: resendingVerification } = useResendVerification();
	const uploadImageMutation = useUploadImage();

	const profileForm = useForm<TProfileEdit>({
		resolver: zodResolver(profileEditSchema),
		values: {
			name: user?.name ?? '',
		},
	});

	const passwordForm = useForm<TChangePassword>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			current_password: '',
			new_password: '',
			confirm_password: '',
		},
	});

	const onSubmitProfile = async (values: TProfileEdit) => {
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

		updateProfile(
			{ name: values.name, ...(avatarUrl ? { avatar_url: avatarUrl } : {}) },
			{
				onSuccess: () => {
					setEditingProfile(false);
					setAvatarFiles([]);
					setReplacingAvatar(false);
					toast.success('Profile updated', { description: 'Your profile has been updated successfully.' });
				},
				onError: (err) => {
					toast.error('Update failed', { description: err.message });
				},
			},
		);
	};

	const onSubmitPassword = (values: TChangePassword) => {
		changePassword(values, {
			onSuccess: () => {
				passwordForm.reset();
				setEditingPassword(false);
				toast.success('Password changed', { description: 'Your password has been changed successfully.' });
			},
			onError: (err) => {
				toast.error('Change failed', { description: err.message });
			},
		});
	};

	const initials = (user?.name ?? '')
		.split(' ')
		.slice(0, 2)
		.map((w: string) => w[0]?.toUpperCase() ?? '')
		.join('');

	const adminRole = user?.roles?.find((r) => r.is_admin);
	const isSavingProfile = updatingProfile || uploadImageMutation.isPending;

	if (isLoading) return (
		<>
			<PageHeader
				breadcrumbs={[{ label: 'Dashboard', href: '/gundala-admin/d' }, { label: 'Profile' }]}
				title="My Profile"
			/>
			<ProfileSkeleton />
		</>
	);

	return (
		<>
			<PageHeader
				breadcrumbs={[{ label: 'Dashboard', href: '/gundala-admin/d' }, { label: 'Profile' }]}
				title="My Profile"
				description="Manage your account information and security settings."
			/>

			<div className="space-y-6">
				{/* Avatar + identity */}
				<div className="flex items-center gap-4">
					<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-lg font-bold overflow-hidden relative">
						{user?.avatar_url ? (
							<Image src={user.avatar_url} alt="Avatar" fill className="object-cover rounded-full" />
						) : (
							initials || <User className="size-5" />
						)}
					</div>

					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<h2 className="text-lg font-bold">{user?.name || user?.email}</h2>
							{adminRole && <Badge variant="default">Admin</Badge>}
							{user?.email_verified ? (
								<Badge variant="secondary" className="flex items-center gap-1">
									<BadgeCheck className="size-3" />
									Verified
								</Badge>
							) : (
								user && (
									<Badge variant="outline" className="flex items-center gap-1 border-amber-600/30 text-amber-600">
										<Mail className="size-3" />
										Not verified
									</Badge>
								)
							)}
						</div>
						<p className="text-sm text-muted-foreground">{user?.email}</p>
						{user && !user.email_verified && (
							<Button
								type="button"
								variant="link"
								size="sm"
								className="h-auto p-0 text-xs"
								disabled={resendingVerification}
								onClick={() => resendVerification(undefined, {
									onSuccess: () => {
										toast.success('Verification email sent', { description: 'Please check your inbox for the verification link.' });
									},
									onError: (err) => {
										toast.error('Failed to send verification email', { description: err.message });
									},
								})}
							>
								{resendingVerification ? 'Sending...' : 'Resend verification email'}
							</Button>
						)}
					</div>
				</div>

				<Separator />

				{/* ── Account Info ── */}
				<Card className="border-muted/50">
					<CardHeader className="pb-4 flex flex-row items-center justify-between">
						<CardTitle className="text-base flex items-center gap-2">
							<User className="size-4" />
							Account Information
						</CardTitle>
						{!editingProfile && (
							<Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
								<Pencil className="size-3.5 mr-1.5" />
								Edit
							</Button>
						)}
					</CardHeader>
					<CardContent>
						{editingProfile ? (
							<Form {...profileForm}>
								<form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
									<div className="grid gap-2">
										<FormLabel>Avatar</FormLabel>
										{user?.avatar_url && !replacingAvatar && avatarFiles.length === 0 ? (
											<div className="relative h-20 w-20">
												<div className="h-20 w-20 overflow-hidden rounded-full ring-1 ring-border relative">
													<Image src={user.avatar_url} alt="Avatar" fill className="object-cover" />
												</div>
												<button
													type="button"
													onClick={() => setReplacingAvatar(true)}
													disabled={isSavingProfile}
													className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
												>
													<X className="size-3.5" />
												</button>
											</div>
										) : (
											<FileUpload
												compact
												compactShape="circle"
												compactSize={80}
												accept="image/*"
												maxSize={5 * 1024 * 1024}
												value={avatarFiles}
												onChange={setAvatarFiles}
												disabled={isSavingProfile}
											/>
										)}
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<FormField control={profileForm.control} name="name" render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl><Input {...field} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />
										<FormItem>
											<FormLabel>Email</FormLabel>
											<Input value={user?.email ?? ''} disabled className="bg-muted/30 text-muted-foreground" />
											<p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
										</FormItem>
									</div>
									<div className="flex justify-end gap-3 pt-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												profileForm.reset();
												setEditingProfile(false);
												setAvatarFiles([]);
												setReplacingAvatar(false);
											}}
											disabled={isSavingProfile}
										>
											<X className="size-3.5 mr-1.5" /> Cancel
										</Button>
										<Button type="submit" size="sm" disabled={isSavingProfile}>
											{isSavingProfile
												? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Saving...</>
												: <><Check className="size-3.5 mr-1.5" />Save</>
											}
										</Button>
									</div>
								</form>
							</Form>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<InfoRow label="Name" value={user?.name} />
								<InfoRow label="Email" value={user?.email} />
								<InfoRow label="Email Verified" value={user?.email_verified ? 'Verified' : 'Not verified'} />
								<InfoRow label="Roles" value={user?.roles?.map((r) => r.name).join(', ') || '—'} />
							</div>
						)}
					</CardContent>
				</Card>

				{/* ── Security / Change Password ── */}
				<Card className="border-muted/50">
					<CardHeader className="pb-4 flex flex-row items-center justify-between">
						<CardTitle className="text-base flex items-center gap-2">
							<Key className="size-4" />
							Security
						</CardTitle>
						{!editingPassword && (
							<Button variant="outline" size="sm" onClick={() => setEditingPassword(true)}>
								<Pencil className="size-3.5 mr-1.5" />
								Change Password
							</Button>
						)}
					</CardHeader>
					<CardContent>
						{editingPassword ? (
							<Form {...passwordForm}>
								<form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
									<FormField control={passwordForm.control} name="current_password" render={({ field }) => (
										<FormItem>
											<FormLabel>Current Password</FormLabel>
											<FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
											<FormMessage />
										</FormItem>
									)} />
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<FormField control={passwordForm.control} name="new_password" render={({ field }) => (
											<FormItem>
												<FormLabel>New Password</FormLabel>
												<FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />
										<FormField control={passwordForm.control} name="confirm_password" render={({ field }) => (
											<FormItem>
												<FormLabel>Confirm New Password</FormLabel>
												<FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />
									</div>
									<div className="flex justify-end gap-3 pt-2">
										<Button type="button" variant="outline" size="sm" onClick={() => { passwordForm.reset(); setEditingPassword(false); }}>
											<X className="size-3.5 mr-1.5" /> Cancel
										</Button>
										<Button type="submit" size="sm" disabled={changingPassword}>
											{changingPassword
												? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Saving...</>
												: <><Check className="size-3.5 mr-1.5" />Save Password</>
											}
										</Button>
									</div>
								</form>
							</Form>
						) : (
							<div className="flex items-center gap-3 text-sm text-muted-foreground">
								<Shield className="size-4 shrink-0" />
								<span>Click &quot;Change Password&quot; to update your password.</span>
							</div>
						)}
					</CardContent>
				</Card>

				{/* ── System Info ── */}
				<Card className="border-muted/50 bg-muted/20">
					<CardHeader className="pb-4">
						<CardTitle className="text-base flex items-center gap-2">
							<Mail className="size-4" />
							System Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<InfoRow
								label="Created"
								value={user?.created_at ? formatTZ(user.created_at, 'D MMMM YYYY') : undefined}
							/>
							<InfoRow
								label="Last Updated"
								value={user?.updated_at ? formatTZ(user.updated_at, 'D MMMM YYYY') : undefined}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
