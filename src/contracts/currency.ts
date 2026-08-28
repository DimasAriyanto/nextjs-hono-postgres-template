import { z } from 'zod';

// ============================================
// CURRENCY CONVERSION
// ============================================
// Rates come from Open Exchange Rates (https://openexchangerates.org), fetched
// server-side and cached — see src/server/services/currency.service.ts.

export const convertCurrencySchema = z.object({
	from: z.string().length(3, 'Currency code must be 3 letters').toUpperCase(),
	to: z.string().length(3, 'Currency code must be 3 letters').toUpperCase(),
	amount: z.coerce.number().positive('Amount must be greater than 0'),
});

export type TConvertCurrencyRequest = z.infer<typeof convertCurrencySchema>;

export interface TConvertCurrencyResponse {
	from: string;
	to: string;
	amount: number;
	rate: number;
	converted: number;
	/** ISO timestamp of the rate snapshot used for this conversion */
	as_of: string;
}
