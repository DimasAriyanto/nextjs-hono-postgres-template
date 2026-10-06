import { getAppCurrency, getAppCurrencyDisplay, getAppLocale } from '@/libs/dayjs';

/**
 * Format a number as currency. Defaults to the app's configured locale/currency/display
 * (Settings > Regional) — used as-is for receipts/invoices, which must always
 * reflect the currency actually settled, never a per-visitor preference.
 *
 * Pass `currency`/`locale`/`display` to format a value in a different currency (e.g. a
 * display-only converted amount for a visitor's chosen currency) without
 * touching the app-wide default.
 *
 * `display: 'symbol'` always renders IDR as "Rp" regardless of locale — Intl only maps
 * IDR to "Rp" under the `id-ID` locale, rendering "IDR" for everyone else otherwise.
 */
export const formatCurrency = (value: number, options?: { currency?: string; locale?: string; display?: 'code' | 'symbol' }) => {
    const currency = options?.currency ?? getAppCurrency();
    const display = options?.display ?? getAppCurrencyDisplay();
    const locale = options?.locale ?? getAppLocale();
    const isIdr = currency === 'IDR';
    const fractionDigits = isIdr ? 0 : (value % 1 === 0 ? 0 : 2);

    if (isIdr && display === 'symbol') {
        const number = new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        return `Rp${number}`;
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: display === 'symbol' ? 'symbol' : 'code',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
};
