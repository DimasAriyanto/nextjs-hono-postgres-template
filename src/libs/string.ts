export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function initials(str: string, max = 2): string {
	return str
		.trim()
		.split(/\s+/)
		.slice(0, max)
		.map((word) => word[0]?.toUpperCase() ?? '')
		.join('');
}

export function capitalize(str: string): string {
	return str
		.toLowerCase()
		.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

export function truncate(str: string, length: number, suffix = '...'): string {
	if (str.length <= length) return str;
	return str.slice(0, length - suffix.length) + suffix;
}

export function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
