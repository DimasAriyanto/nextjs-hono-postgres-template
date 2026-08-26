import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as articleCategoryApi from '@/features/article-category/apis/article-category.api';
import type { TCreateArticleCategoryRequest, TUpdateArticleCategoryRequest } from '@/contracts';

/**
 * Query keys for article categories
 */
export const articleCategoryKeys = {
	all: ['article-categories'] as const,
	lists: () => [...articleCategoryKeys.all, 'list'] as const,
	list: (params?: { search?: string }) => [...articleCategoryKeys.lists(), params] as const,
};

/**
 * Hook to get all categories
 */
export function useArticleCategories(params?: { search?: string }) {
	return useQuery({
		queryKey: articleCategoryKeys.list(params),
		queryFn: () => articleCategoryApi.getArticleCategories(params),
	});
}

/**
 * Hook for create category mutation
 */
export function useCreateArticleCategory(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateArticleCategoryRequest) => articleCategoryApi.createArticleCategory(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: articleCategoryKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for update category mutation
 */
export function useUpdateArticleCategory(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateArticleCategoryRequest }) => articleCategoryApi.updateArticleCategory(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: articleCategoryKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for delete category mutation
 */
export function useDeleteArticleCategory(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => articleCategoryApi.deleteArticleCategory(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: articleCategoryKeys.lists() });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
