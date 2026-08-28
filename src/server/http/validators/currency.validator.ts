import { convertCurrencySchema } from '@/contracts';
import { validateQuery } from './helper';

/**
 * Convert currency request validator
 */
export const convertCurrencyRequest = validateQuery(convertCurrencySchema);
