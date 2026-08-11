/**
 * Dayjs global configuration
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
import 'dayjs/locale/id';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('id');

/** Default timezone used until the app's Settings > Regional value is loaded */
export const TZ_WIB = 'Asia/Jakarta';

// Module-level, client-only state — safe because every consumer of this file
// is a 'use client' component (one browser tab per user), never server code.
let appTimezone: string = TZ_WIB;

/** Set the application's configured timezone (call this once Settings are loaded/saved) */
export function setAppTimezone(tz: string | null | undefined): void {
	appTimezone = tz && tz.trim() ? tz : TZ_WIB;
}

/** Get the currently configured application timezone */
export function getAppTimezone(): string {
	return appTimezone;
}

/** Format a UTC-stored timestamp in the app's configured timezone */
export function formatTZ(value: string | null | undefined, format: string): string {
	if (!value) return '-';
	return dayjs.utc(value).tz(appTimezone).locale('id').format(format);
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
