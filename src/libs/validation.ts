import { z } from 'zod';

export const zPhoneID = z
	.string()
	.regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Invalid phone number (Indonesian format)');

export const zNIK = z
	.string()
	.length(16, 'NIK must be 16 digits')
	.regex(/^\d+$/, 'NIK can only contain numbers');

export const zNPWP = z
	.string()
	.regex(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, 'Invalid NPWP (format: 00.000.000.0-000.000)');

export const zSlug = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, numbers, and hyphens are allowed');

export const zPriceMin = (min = 0) =>
	z.number().min(min, `Minimum ${min}`);

export const zRequiredString = (label = 'Field') =>
	z.string().min(1, `${label} is required`);

export const zOptionalString = z.string().optional().nullable();

export const zPositiveInt = z
	.number()
	.int('Must be a whole number')
	.positive('Must be greater than 0');

export const zUrlOptional = z
	.string()
	.url('Invalid URL')
	.optional()
	.or(z.literal(''));

export const zDateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD');

export const zEmailOptional = z.string().email('Invalid email').optional().or(z.literal(''));
