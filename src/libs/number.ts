export function formatNumber(value: number, locale = 'id-ID'): string {
	return new Intl.NumberFormat(locale).format(value);
}

export function abbreviate(value: number): string {
	const abs = Math.abs(value);
	const sign = value < 0 ? '-' : '';

	if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`;
	if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}rb`;
	return `${sign}${abs}`;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function roundTo(value: number, decimals: number): number {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

export function percentage(part: number, total: number, decimals = 1): number {
	if (total === 0) return 0;
	return roundTo((part / total) * 100, decimals);
}

export function isNumeric(value: unknown): boolean {
	return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
