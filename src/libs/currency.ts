import { getAppCurrency, getAppLocale } from '@/libs/dayjs';

/**
 * Format a number as currency. Defaults to the app's configured locale/currency
 * (Settings > Regional) — used as-is for receipts/invoices, which must always
 * reflect the currency actually settled, never a per-visitor preference.
 *
 * Pass `currency`/`locale` to format a value in a different currency (e.g. a
 * display-only converted amount for a visitor's chosen currency) without
 * touching the app-wide default.
 */
export const formatCurrency = (value: number, options?: { currency?: string; locale?: string }) => {
    const currency = options?.currency ?? getAppCurrency();
    const isIdr = currency === 'IDR';
    return new Intl.NumberFormat(options?.locale ?? getAppLocale(), {
        style: 'currency',
        currency,
        minimumFractionDigits: isIdr ? 0 : (value % 1 === 0 ? 0 : 2),
        maximumFractionDigits: isIdr ? 0 : 2,
    }).format(value);
};

