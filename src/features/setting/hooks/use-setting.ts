import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as settingApi from '@/features/setting/apis/setting.api';
import { setAppCurrency, setAppLocale, setAppTimezone } from '@/libs/dayjs';
import type { TContentLocale, TUpdateSettingRequest } from '@/contracts';

/**
 * Query keys for settings
 */
export const settingKeys = {
	all: ['settings'] as const,
	locale: (contentLocale: TContentLocale) => [...settingKeys.all, contentLocale] as const,
};

/**
 * Hook to get application settings. Pass `contentLocale` (from next-intl's
 * `useLocale()`) when the caller needs translatable fields (about_content,
 * faqs, banners, etc.) resolved for the visitor's language — e.g. the public
 * home page. Callers that only need the `translations` bundle or
 * non-translatable fields (the admin settings form, header/footer) can omit it.
 */
export function useSettings(contentLocale?: TContentLocale) {
	return useQuery({
		queryKey: contentLocale ? settingKeys.locale(contentLocale) : settingKeys.all,
		queryFn: () => settingApi.getSettings(contentLocale),
	});
}

/**
 * Hook for update settings mutation
 */
export function useUpdateSettings(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TUpdateSettingRequest) => settingApi.updateSettings(data),
		onSuccess: (res) => {
			setAppTimezone(res.data.timezone);
			setAppLocale(res.data.locale);
			setAppCurrency(res.data.currency);
			// The admin form's own (localeless) query gets the fresh response directly; other
			// content-locale-scoped queries (e.g. the public home page) just get invalidated,
			// since this response only resolved translatable fields for one content locale.
			queryClient.setQueryData(settingKeys.all, res);
			queryClient.invalidateQueries({ queryKey: settingKeys.all });
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
