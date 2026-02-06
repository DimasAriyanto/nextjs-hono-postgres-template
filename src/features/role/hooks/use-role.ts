import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as roleApi from '@/features/role/apis/role.api';
import type { TCreateRoleRequest, TUpdateRoleRequest, TAssignPermissionRequest } from '@/contracts';

/**
 * Query keys for roles
 */
export const roleKeys = {
	all: ['roles'] as const,
	lists: () => [...roleKeys.all, 'list'] as const,
	list: (params?: { page?: number; limit?: number; search?: string }) => [...roleKeys.lists(), params] as const,
	details: () => [...roleKeys.all, 'detail'] as const,
	detail: (id: string) => [...roleKeys.details(), id] as const,
	withUsers: (id: string) => [...roleKeys.detail(id), 'users'] as const,
	withPermissions: (id: string) => [...roleKeys.detail(id), 'permissions'] as const,
};

/**
 * Hook to get all roles with pagination
 */
export function useRoles(params?: { page?: number; limit?: number; search?: string }) {
	return useQuery({
		queryKey: roleKeys.list(params),
		queryFn: () => roleApi.getRoles(params),
	});
}

/**
 * Hook to get role by ID
 */
export function useRole(id: string) {
	return useQuery({
		queryKey: roleKeys.detail(id),
		queryFn: () => roleApi.getRoleById(id),
		enabled: !!id,
	});
}

/**
 * Hook to get role with users
 */
export function useRoleWithUsers(id: string) {
	return useQuery({
		queryKey: roleKeys.withUsers(id),
		queryFn: () => roleApi.getRoleWithUsers(id),
		enabled: !!id,
	});
}

/**
 * Hook to get role with permissions
 */
export function useRoleWithPermissions(id: string) {
	return useQuery({
		queryKey: roleKeys.withPermissions(id),
		queryFn: () => roleApi.getRoleWithPermissions(id),
		enabled: !!id,
	});
}

/**
 * Hook for create role mutation
 */
export function useCreateRole(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateRoleRequest) => roleApi.createRole(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for update role mutation
 */
export function useUpdateRole(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateRoleRequest }) => roleApi.updateRole(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for delete role mutation
 */
export function useDeleteRole(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => roleApi.deleteRole(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for assign permission to role mutation
 */
export function useAssignPermission(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roleId, data }: { roleId: string; data: TAssignPermissionRequest }) =>
			roleApi.assignPermission(roleId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for remove permission from role mutation
 */
export function useRemovePermission(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
			roleApi.removePermission(roleId, permissionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
