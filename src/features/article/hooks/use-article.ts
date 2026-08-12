import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as articleApi from '@/features/article/apis/article.api';
import type { TArticleStatus, TCreateArticleRequest, TUpdateArticleRequest } from '@/contracts';

/**
 * Query keys for articles
 */
export const articleKeys = {
	all: ['articles'] as const,
	lists: () => [...articleKeys.all, 'list'] as const,
	list: (params?: { page?: number; limit?: number; search?: string; status?: TArticleStatus }) => [...articleKeys.lists(), params] as const,
	details: () => [...articleKeys.all, 'detail'] as const,
	detail: (id: string) => [...articleKeys.details(), id] as const,
	publicLists: () => [...articleKeys.all, 'public-list'] as const,
	publicList: (params?: { page?: number; limit?: number; search?: string }) => [...articleKeys.publicLists(), params] as const,
	publicDetails: () => [...articleKeys.all, 'public-detail'] as const,
	publicDetail: (slug: string) => [...articleKeys.publicDetails(), slug] as const,
};

/**
 * Hook to get all articles with pagination
 */
export function useArticles(params?: { page?: number; limit?: number; search?: string; status?: TArticleStatus }) {
	return useQuery({
		queryKey: articleKeys.list(params),
		queryFn: () => articleApi.getArticles(params),
	});
}

/**
 * Hook to get article by ID
 */
export function useArticle(id: string) {
	return useQuery({
		queryKey: articleKeys.detail(id),
		queryFn: () => articleApi.getArticleById(id),
		enabled: !!id,
	});
}

/**
 * Hook to get published articles with pagination — public pages
 */
export function usePublicArticles(params?: { page?: number; limit?: number; search?: string }) {
	return useQuery({
		queryKey: articleKeys.publicList(params),
		queryFn: () => articleApi.getPublicArticles(params),
	});
}

/**
 * Hook to get a published article by slug — public pages
 */
export function usePublicArticleBySlug(slug: string) {
	return useQuery({
		queryKey: articleKeys.publicDetail(slug),
		queryFn: () => articleApi.getPublicArticleBySlug(slug),
		enabled: !!slug,
	});
}

/**
 * Hook for create article mutation
 */
export function useCreateArticle(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateArticleRequest) => articleApi.createArticle(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for update article mutation
 */
export function useUpdateArticle(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateArticleRequest }) => articleApi.updateArticle(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: articleKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for delete article mutation
 */
export function useDeleteArticle(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => articleApi.deleteArticle(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
