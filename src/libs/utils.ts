import { Buffer } from 'buffer';

export const encoded = (value: string) => {
	return Buffer.from(value).toString('base64');
};

export const decoded = (value: string) => {
	return Buffer.from(value, 'base64').toString();
};

export const formatFieldErrors = (
	fieldErrors:
		| {
				[key: string]: string[] | undefined;
		  }
		| undefined,
) => {
	return Object.entries(fieldErrors || {}).reduce((acc, [field, error]) => {
		acc[field] = error?.join(', ') || '';
		return acc;
	}, {} as Record<string, string>);
};

export const limitContentText = (data: string = 'This is sentence', limit: number | null) => {
	if (!limit) return data;
	return data && data.length > limit ? `${data.substring(0, limit)} ...` : data;
};

export const parseIntervalToSeconds = (interval: string) => {
	const [hh, mm, ss] = interval.split(':').map(Number);
	return hh * 3600 + mm * 60 + (ss || 0); // total in seconds
};

export const isUUID = (str: string): boolean => {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};
