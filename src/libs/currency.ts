import { getAppCurrency, getAppLocale } from '@/libs/dayjs';

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(getAppLocale(), {
        style: 'currency',
        currency: getAppCurrency(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
