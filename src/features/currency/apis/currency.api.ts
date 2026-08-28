import { client, handleResponse, ApiError } from '@/libs/api';
import type { TConvertCurrencyResponse } from '@/contracts';
import type { ApiSuccessResponse } from '@/types/api-response';

interface ConvertCurrencyParams {
	from: string;
	to: string;
	amount: number;
}

/**
 * GET /api/v1/currency/convert
 * Convert an amount between two currencies using the latest cached rate.
 */
export async function convertCurrency(params: ConvertCurrencyParams): Promise<ApiSuccessResponse<TConvertCurrencyResponse>> {
	return handleResponse<TConvertCurrencyResponse>(
		client.api.v1.currency.convert.$get({
			query: {
				from: params.from,
				to: params.to,
				amount: String(params.amount),
			},
		})
	);
}

// Re-export ApiError for error handling
export { ApiError };
