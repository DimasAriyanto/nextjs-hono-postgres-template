/**
 * Dayjs global configuration
 *
 * Extends dayjs with UTC + timezone plugins.
 * All timestamps in the DB are stored as UTC (TIMESTAMPTZ).
 * Use formatTZ() to display in WIB (Asia/Jakarta, UTC+7).
 * Use toUTC() to convert user-input WIB datetime to UTC before sending to API.
 * Use toWIBLocal() to convert UTC from DB to WIB local for form pickers.
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/id';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('id');

export const TZ_WIB = 'Asia/Jakarta';

/** Format a UTC-stored timestamp to WIB local time */
export function formatTZ(value: string | null | undefined, format: string): string {
	if (!value) return '-';
	return dayjs.utc(value).tz(TZ_WIB).locale('id').format(format);
}

/** Convert a WIB local datetime string (YYYY-MM-DDTHH:mm:ss from form picker) to UTC ISO string */
export function toUTC(wibLocalString: string | null | undefined): string {
	if (!wibLocalString) return '';
	return dayjs.tz(wibLocalString, TZ_WIB).utc().toISOString();
}

/** Convert UTC ISO string from DB to WIB local datetime string for form picker */
export function toWIBLocal(utcString: string | null | undefined): string {
	if (!utcString) return '';
	return dayjs.utc(utcString).tz(TZ_WIB).format('YYYY-MM-DDTHH:mm:ss');
}

export default dayjs;
