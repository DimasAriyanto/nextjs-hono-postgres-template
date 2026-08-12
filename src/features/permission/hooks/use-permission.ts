import { useQuery } from '@tanstack/react-query';
import * as permissionApi from '@/features/permission/apis/permission.api';

/**
 * Query keys for permissions
 */
export const permissionKeys = {
	all: ['permissions'] as const,
	lists: () => [...permissionKeys.all, 'list'] as const,
};

/**
 * Hook to get all permissions
 */
export function usePermissions() {
	return useQuery({
		queryKey: permissionKeys.lists(),
		queryFn: () => permissionApi.getPermissions(),
	});
}
