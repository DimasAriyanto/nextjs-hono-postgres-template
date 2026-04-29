export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
	return arr.reduce(
		(acc, item) => {
			const group = String(item[key]);
			if (!acc[group]) acc[group] = [];
			acc[group].push(item);
			return acc;
		},
		{} as Record<string, T[]>,
	);
}

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
	const seen = new Set<unknown>();
	return arr.filter((item) => {
		const val = item[key];
		if (seen.has(val)) return false;
		seen.add(val);
		return true;
	});
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

export function sortBy<T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
	return [...arr].sort((a, b) => {
		const va = a[key];
		const vb = b[key];
		if (va < vb) return direction === 'asc' ? -1 : 1;
		if (va > vb) return direction === 'asc' ? 1 : -1;
		return 0;
	});
}

export function flatUnique<T>(arr: T[][]): T[] {
	return [...new Set(arr.flat())];
}

export function toggleItem<T>(arr: T[], item: T): T[] {
	return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}
