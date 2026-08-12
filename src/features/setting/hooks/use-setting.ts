import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as settingApi from '@/features/setting/apis/setting.api';
import { setAppCurrency, setAppLocale, setAppTimezone } from '@/libs/dayjs';
import type { TUpdateSettingRequest } from '@/contracts';

/**
 * Query keys for settings
 */
export const settingKeys = {
	all: ['settings'] as const,
};

/**
 * Hook to get application settings
 */
export function useSettings() {
	return useQuery({
		queryKey: settingKeys.all,
		queryFn: () => settingApi.getSettings(),
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
			queryClient.setQueryData(settingKeys.all, res);
			options?.onSuccess?.();
		},
		onError: options?.onError,
	});
}
