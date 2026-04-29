/**
 * WIB date utilities — for use in sequential code generation and DATE column comparisons.
 *
 * Note: Timestamps in the DB are stored as UTC (TIMESTAMPTZ).
 * These helpers are only for deriving WIB date parts used in:
 *   - Sequential codes (RENT-YYMM-NNNN) where the prefix shows the WIB date
 *   - Comparisons against DATE-type columns (promotions, expenses, etc.)
 *
 * For system-generated timestamps, use: new Date().toISOString()
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7

/** Returns current WIB date as "YYYY-MM-DD" */
export function todayWIB(): string {
	const wib = new Date(Date.now() + WIB_OFFSET_MS);
	return wib.toISOString().split('T')[0];
}

/** Returns current WIB year-month as "YYYY-MM" */
export function thisMonthWIB(): string {
	return todayWIB().slice(0, 7);
}

/** Returns WIB date parts — used for sequential number generation */
export function nowWIBParts(): { year: number; month: string; day: string } {
	const wib = new Date(Date.now() + WIB_OFFSET_MS);
	const iso = wib.toISOString();
	const [datePart] = iso.split('T');
	const [year, month, day] = datePart.split('-');
	return { year: Number(year), month, day };
}

/**
 * Convert a plain date string (YYYY-MM-DD) to WIB start-of-day ISO string.
 * Use as the lower bound when filtering TIMESTAMPTZ columns by WIB date.
 * e.g. '2026-04-10' → '2026-04-10T00:00:00+07:00'
 */
export function dateToWIBStart(dateStr: string): string {
	const datePart = dateStr.split('T')[0];
	return `${datePart}T00:00:00+07:00`;
}

/**
 * Convert a plain date string (YYYY-MM-DD) to WIB end-of-day ISO string.
 * Use as the upper bound when filtering TIMESTAMPTZ columns by WIB date.
 * e.g. '2026-04-10' → '2026-04-10T23:59:59+07:00'
 */
export function dateToWIBEnd(dateStr: string): string {
	const datePart = dateStr.split('T')[0];
	return `${datePart}T23:59:59+07:00`;
}
