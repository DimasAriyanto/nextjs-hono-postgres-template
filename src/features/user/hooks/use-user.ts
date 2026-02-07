import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userApi from '@/features/user/apis/user.api';
import type { TCreateUserRequest, TUpdateUserRequest, TAssignRoleRequest } from '@/contracts';

/**
 * Query keys for users
 */
export const userKeys = {
	all: ['users'] as const,
	lists: () => [...userKeys.all, 'list'] as const,
	list: (params?: { page?: number; limit?: number; search?: string }) => [...userKeys.lists(), params] as const,
	details: () => [...userKeys.all, 'detail'] as const,
	detail: (id: string) => [...userKeys.details(), id] as const,
	withRoles: (id: string) => [...userKeys.detail(id), 'roles'] as const,
};

/**
 * Hook to get all users with pagination
 */
export function useUsers(params?: { page?: number; limit?: number; search?: string }) {
	return useQuery({
		queryKey: userKeys.list(params),
		queryFn: () => userApi.getUsers(params),
	});
}

/**
 * Hook to get user by ID
 */
export function useUser(id: string) {
	return useQuery({
		queryKey: userKeys.detail(id),
		queryFn: () => userApi.getUserById(id),
		enabled: !!id,
	});
}

/**
 * Hook to get user with roles
 */
export function useUserWithRoles(id: string) {
	return useQuery({
		queryKey: userKeys.withRoles(id),
		queryFn: () => userApi.getUserWithRoles(id),
		enabled: !!id,
	});
}

/**
 * Hook for create user mutation
 */
export function useCreateUser(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateUserRequest) => userApi.createUser(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for update user mutation
 */
export function useUpdateUser(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateUserRequest }) => userApi.updateUser(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for delete user mutation
 */
export function useDeleteUser(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => userApi.deleteUser(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for assign role to user mutation
 */
export function useAssignRole(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: TAssignRoleRequest }) =>
			userApi.assignRole(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for remove role from user mutation
 */
export function useRemoveRole(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
			userApi.removeRole(userId, roleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
