import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '../apis/notification.api';
import type { TCreateNotificationRequest } from '@/contracts/notification';

export const notificationKeys = {
	all: ['notifications'] as const,
	lists: () => [...notificationKeys.all, 'list'] as const,
	list: (params?: object) => [...notificationKeys.lists(), params] as const,
	unread: () => [...notificationKeys.all, 'unread'] as const,
	detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
};

export function useNotifications(params?: { page?: number; limit?: number; is_read?: boolean }) {
	return useQuery({
		queryKey: notificationKeys.list(params),
		queryFn: () => notificationApi.getNotifications(params),
	});
}

export function useUnreadNotifications() {
	return useQuery({
		queryKey: notificationKeys.unread(),
		queryFn: () => notificationApi.getUnreadNotifications(),
		refetchInterval: 30_000, // poll every 30s
	});
}

export function useMarkAsRead(options?: { onSuccess?: () => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => notificationApi.markAsRead(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
			queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
			queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
			options?.onSuccess?.();
		},
	});
}

export function useMarkAllAsRead(options?: { onSuccess?: () => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => notificationApi.markAllAsRead(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.all });
			options?.onSuccess?.();
		},
	});
}

export function useCreateNotification(options?: { onSuccess?: () => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateNotificationRequest) => notificationApi.createNotification(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
			queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
			options?.onSuccess?.();
		},
	});
}

export function useDeleteNotification(options?: { onSuccess?: () => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => notificationApi.deleteNotification(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.all });
			options?.onSuccess?.();
		},
	});
}
