'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/features/permission/hooks/use-permission';
import { useRoleWithPermissions, useAssignPermission, useRemovePermission } from '@/features/role/hooks/use-role';
import { MENU_PERMISSIONS } from '@/constants/permissions';
import { toast } from 'sonner';
import type { TRole } from '@/contracts';

interface RolePermissionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	role: TRole | null;
}

export function RolePermissionsModal({ isOpen, onClose, role }: RolePermissionsModalProps) {
	const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions();
	const { data: roleData, isLoading: isLoadingRole } = useRoleWithPermissions(role?.id ?? '');

	const assignMutation = useAssignPermission();
	const removeMutation = useRemovePermission();

	const permissions = permissionsData?.data ?? [];
	const permissionByKey = new Map(permissions.map((p) => [p.name, p]));
	const assignedIds = new Set((roleData?.data?.permissions ?? []).map((p) => p.id));
	const menus = Array.from(new Set(MENU_PERMISSIONS.map((p) => p.menu)));

	const handleToggle = async (permissionId: string, checked: boolean) => {
		if (!role) return;

		try {
			if (checked) {
				await assignMutation.mutateAsync({ roleId: role.id, data: { permission_id: permissionId } });
			} else {
				await removeMutation.mutateAsync({ roleId: role.id, permissionId });
			}
		} catch {
			toast.error('Failed to update permission');
		}
	};

	const isLoading = isLoadingPermissions || isLoadingRole;
	const isMutating = assignMutation.isPending || removeMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Manage Permissions</DialogTitle>
					<DialogDescription>
						Choose which menus the &quot;{role?.name}&quot; role can access.
					</DialogDescription>
				</DialogHeader>

				{role?.is_admin ? (
					<p className="py-4 text-sm text-muted-foreground">
						This role has full access to all menus and does not use individual permissions.
					</p>
				) : isLoading ? (
					<p className="py-4 text-sm text-muted-foreground">Loading...</p>
				) : (
					<div className="grid gap-3 py-4">
						{menus.map((menu) => {
							const actions = MENU_PERMISSIONS.filter((p) => p.menu === menu);
							return (
								<div key={menu} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
									<span className="text-sm font-medium">{menu}</span>
									<div className="flex gap-4">
										{actions.map((action) => {
											const permission = permissionByKey.get(action.key);
											if (!permission) return null;
											return (
												<div key={action.key} className="flex items-center gap-2">
													<Checkbox
														id={permission.id}
														checked={assignedIds.has(permission.id)}
														onCheckedChange={(checked) => handleToggle(permission.id, checked === true)}
														disabled={isMutating}
													/>
													<Label htmlFor={permission.id} className="cursor-pointer capitalize">{action.action}</Label>
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				)}

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
