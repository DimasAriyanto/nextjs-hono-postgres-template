import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as galleryApi from '@/features/gallery/apis/gallery.api';
import type { TCreateGalleryRequest } from '@/contracts';

/**
 * Query keys for gallery images
 */
export const galleryKeys = {
	all: ['galleries'] as const,
	lists: () => [...galleryKeys.all, 'list'] as const,
	list: (params?: { page?: number; limit?: number; search?: string }) => [...galleryKeys.lists(), params] as const,
	publicLists: () => [...galleryKeys.all, 'public-list'] as const,
	publicList: (params?: { page?: number; limit?: number; search?: string }) => [...galleryKeys.publicLists(), params] as const,
};

/**
 * Hook to get all gallery images with pagination
 */
export function useGalleries(params?: { page?: number; limit?: number; search?: string }) {
	return useQuery({
		queryKey: galleryKeys.list(params),
		queryFn: () => galleryApi.getGalleries(params),
	});
}

/**
 * Hook to get gallery images with pagination — public pages
 */
export function usePublicGalleries(params?: { page?: number; limit?: number; search?: string }) {
	return useQuery({
		queryKey: galleryKeys.publicList(params),
		queryFn: () => galleryApi.getPublicGalleries(params),
	});
}

/**
 * Hook for add-to-gallery mutation
 */
export function useCreateGallery(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateGalleryRequest) => galleryApi.createGallery(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for delete gallery image mutation
 */
export function useDeleteGallery(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => galleryApi.deleteGallery(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
