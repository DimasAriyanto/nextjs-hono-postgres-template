'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	User, Mail, Shield, Key, Pencil, Check, X, BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { useProfile, useUpdateProfile, useChangePassword } from '@/features/auth/hooks/use-auth';
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

	const { data: profileRes, isLoading } = useProfile();
	const user = profileRes?.data;

	const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile();
	const { mutate: changePassword, isPending: changingPassword } = useChangePassword();

	const profileForm = useForm<TProfileEdit>({
		resolver: zodResolver(profileEditSchema),
		values: {
			name: (user as { name?: string })?.name ?? '',
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

	const onSubmitProfile = (values: TProfileEdit) => {
		updateProfile(values, {
			onSuccess: () => setEditingProfile(false),
		});
	};

	const onSubmitPassword = (values: TChangePassword) => {
		changePassword(values, {
			onSuccess: () => {
				passwordForm.reset();
				setEditingPassword(false);
			},
		});
	};

	const initials = ((user as { name?: string })?.name ?? '')
		.split(' ')
		.slice(0, 2)
		.map((w: string) => w[0]?.toUpperCase() ?? '')
		.join('');

	const adminRole = user?.roles?.find((r) => r.is_admin);

	if (isLoading) return (
		<>
			<PageHeader
				breadcrumbs={[
					{ label: 'Dashboard', href: '/gundala-admin/d' },
					{ label: 'Profile' },
				]}
				title="My Profile"
			/>
			<ProfileSkeleton />
		</>
	);

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ label: 'Dashboard', href: '/gundala-admin/d' },
					{ label: 'Profile' },
				]}
				title="My Profile"
				description="Manage your account information and security settings."
			/>

			<div className="space-y-6">
				{/* Avatar + identity */}
				<div className="flex items-center gap-4">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background text-lg font-bold shrink-0">
						{initials || <User className="size-5" />}
					</div>
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<h2 className="text-lg font-bold">{(user as { name?: string })?.name || user?.email}</h2>
							{adminRole && (
								<Badge variant="default">Admin</Badge>
							)}
							{user?.email_verified && (
								<Badge variant="secondary" className="flex items-center gap-1">
									<BadgeCheck className="size-3" />
									Verified
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">{user?.email}</p>
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
										<Button type="button" variant="outline" size="sm" onClick={() => { profileForm.reset(); setEditingProfile(false); }} disabled={updatingProfile}>
											<X className="size-3.5 mr-1.5" /> Cancel
										</Button>
										<Button type="submit" size="sm" disabled={updatingProfile}>
											<Check className="size-3.5 mr-1.5" />
											{updatingProfile ? 'Saving...' : 'Save'}
										</Button>
									</div>
								</form>
							</Form>
						) : (
							<div className="grid grid-cols-2 gap-4">
								<InfoRow label="Name" value={(user as { name?: string })?.name} />
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
											<Check className="size-3.5 mr-1.5" />
											{changingPassword ? 'Saving...' : 'Save Password'}
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
						<div className="grid grid-cols-2 gap-4">
							<InfoRow
								label="Created"
								value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined}
							/>
							<InfoRow
								label="Last Updated"
								value={user?.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
