import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as faqApi from '@/features/faq/apis/faq.api';
import type { TContentLocale, TCreateFaqRequest, TUpdateFaqRequest } from '@/contracts';

/**
 * Query keys for faqs
 */
export const faqKeys = {
	all: ['faqs'] as const,
	lists: () => [...faqKeys.all, 'list'] as const,
	list: (params?: { page?: number; limit?: number; search?: string; locale?: TContentLocale }) => [...faqKeys.lists(), params] as const,
	details: () => [...faqKeys.all, 'detail'] as const,
	detail: (id: string) => [...faqKeys.details(), id] as const,
	publicLists: () => [...faqKeys.all, 'public-list'] as const,
	publicList: (locale?: TContentLocale) => [...faqKeys.publicLists(), locale] as const,
};

/**
 * Hook to get all faqs with pagination
 */
export function useFaqs(params?: { page?: number; limit?: number; search?: string; locale?: TContentLocale }) {
	return useQuery({
		queryKey: faqKeys.list(params),
		queryFn: () => faqApi.getFaqs(params),
	});
}

/**
 * Hook to get faq by ID
 */
export function useFaq(id: string) {
	return useQuery({
		queryKey: faqKeys.detail(id),
		queryFn: () => faqApi.getFaqById(id),
		enabled: !!id,
	});
}

/**
 * Hook to get all faqs for a locale — public pages
 */
export function usePublicFaqs(locale?: TContentLocale) {
	return useQuery({
		queryKey: faqKeys.publicList(locale),
		queryFn: () => faqApi.getPublicFaqs(locale),
	});
}

/**
 * Hook for create faq mutation
 */
export function useCreateFaq(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TCreateFaqRequest) => faqApi.createFaq(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: faqKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for update faq mutation
 */
export function useUpdateFaq(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TUpdateFaqRequest }) => faqApi.updateFaq(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: faqKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}

/**
 * Hook for delete faq mutation
 */
export function useDeleteFaq(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => faqApi.deleteFaq(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: faqKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
