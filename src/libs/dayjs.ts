/**
 * Dayjs global configuration + app-wide regional preferences (timezone, locale, currency)
 *
 * Extends dayjs with UTC + timezone plugins.
 * All timestamps in the DB are stored as UTC (TIMESTAMPTZ).
 * Use formatTZ() to display in the app's configured timezone (default WIB / Asia/Jakarta).
 * Use toUTC() to convert user-input local datetime to UTC before sending to API.
 * Use toWIBLocal() to convert UTC from DB to local datetime for form pickers.
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/id';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/hi';
import 'dayjs/locale/ar';
import 'dayjs/locale/fr';
import 'dayjs/locale/de';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);

/** Default timezone used until the app's Settings > Regional value is loaded */
export const TZ_WIB = 'Asia/Jakarta';

/** Default locale/currency used until the app's Settings > Regional value is loaded */
export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_CURRENCY = 'IDR';

/** BCP-47 locale tags (used by Intl.*) supported by Settings > Regional, mapped to their dayjs locale key */
export const LOCALE_OPTIONS = [
	{ value: 'en-US', label: 'English (United States)', dayjs: 'en' },
	{ value: 'en-GB', label: 'English (United Kingdom)', dayjs: 'en-gb' },
	{ value: 'id-ID', label: 'Bahasa Indonesia', dayjs: 'id' },
	{ value: 'ja-JP', label: 'Japanese', dayjs: 'ja' },
	{ value: 'ko-KR', label: 'Korean', dayjs: 'ko' },
	{ value: 'zh-CN', label: 'Chinese (Simplified)', dayjs: 'zh-cn' },
	{ value: 'hi-IN', label: 'Hindi', dayjs: 'hi' },
	{ value: 'ar-AE', label: 'Arabic', dayjs: 'ar' },
	{ value: 'fr-FR', label: 'French', dayjs: 'fr' },
	{ value: 'de-DE', label: 'German', dayjs: 'de' },
	{ value: 'es-ES', label: 'Spanish', dayjs: 'es' },
] as const;

const DAYJS_LOCALE_MAP: Record<string, string> = Object.fromEntries(LOCALE_OPTIONS.map((l) => [l.value, l.dayjs]));

// Module-level, client-only state — safe because every consumer of this file
// is a 'use client' component (one browser tab per user), never server code.
let appTimezone: string = TZ_WIB;
let appLocale: string = DEFAULT_LOCALE;
let appCurrency: string = DEFAULT_CURRENCY;

dayjs.locale(DAYJS_LOCALE_MAP[appLocale]);

/** Set the application's configured timezone (call this once Settings are loaded/saved) */
export function setAppTimezone(tz: string | null | undefined): void {
	appTimezone = tz && tz.trim() ? tz : TZ_WIB;
}

/** Get the currently configured application timezone */
export function getAppTimezone(): string {
	return appTimezone;
}

/** Set the application's configured locale (call this once Settings are loaded/saved) */
export function setAppLocale(locale: string | null | undefined): void {
	appLocale = locale && DAYJS_LOCALE_MAP[locale] ? locale : DEFAULT_LOCALE;
	dayjs.locale(DAYJS_LOCALE_MAP[appLocale]);
}

/** Get the currently configured application locale (BCP-47 tag, e.g. "en-US") */
export function getAppLocale(): string {
	return appLocale;
}

/** Set the application's configured currency (ISO 4217 code, e.g. "IDR") */
export function setAppCurrency(currency: string | null | undefined): void {
	appCurrency = currency && currency.trim() ? currency.trim().toUpperCase() : DEFAULT_CURRENCY;
}

/** Get the currently configured application currency */
export function getAppCurrency(): string {
	return appCurrency;
}

/** Format a UTC-stored timestamp in the app's configured timezone and locale */
export function formatTZ(value: string | null | undefined, format: string): string {
	if (!value) return '-';
	return dayjs.utc(value).tz(appTimezone).locale(DAYJS_LOCALE_MAP[appLocale]).format(format);
}

/** Convert a local datetime string (YYYY-MM-DDTHH:mm:ss from form picker) in the app's timezone to UTC ISO string */
export function toUTC(localString: string | null | undefined): string {
	if (!localString) return '';
	return dayjs.tz(localString, appTimezone).utc().toISOString();
}

/** Convert UTC ISO string from DB to local datetime string (app's timezone) for form pickers */
export function toWIBLocal(utcString: string | null | undefined): string {
	if (!utcString) return '';
	return dayjs.utc(utcString).tz(appTimezone).format('YYYY-MM-DDTHH:mm:ss');
}

export default dayjs;
