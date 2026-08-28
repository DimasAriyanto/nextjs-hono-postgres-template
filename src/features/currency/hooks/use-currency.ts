import { useQuery } from '@tanstack/react-query';
import * as currencyApi from '@/features/currency/apis/currency.api';

interface UseConvertCurrencyParams {
	from: string;
	to: string;
	amount: number;
	enabled?: boolean;
}

/**
 * Hook to convert an amount between two currencies using the latest cached rate.
 * Skips the request entirely when `from` and `to` are the same currency.
 */
export function useConvertCurrency({ from, to, amount, enabled = true }: UseConvertCurrencyParams) {
	return useQuery({
		queryKey: ['currency-convert', from, to, amount],
		queryFn: () => currencyApi.convertCurrency({ from, to, amount }),
		enabled: enabled && !!from && !!to && from !== to && amount > 0,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});
}
