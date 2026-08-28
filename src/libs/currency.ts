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
    return new Intl.NumberFormat(options?.locale ?? getAppLocale(), {
        style: 'currency',
        currency: options?.currency ?? getAppCurrency(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
