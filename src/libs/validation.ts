import { z } from 'zod';

export const zPhoneID = z
	.string()
	.regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Nomor HP tidak valid (format Indonesia)');

export const zNIK = z
	.string()
	.length(16, 'NIK harus 16 digit')
	.regex(/^\d+$/, 'NIK hanya boleh angka');

export const zNPWP = z
	.string()
	.regex(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/, 'NPWP tidak valid (format: 00.000.000.0-000.000)');

export const zSlug = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Hanya huruf kecil, angka, dan tanda hubung');

export const zPriceMin = (min = 0) =>
	z.number().min(min, `Minimal ${min}`);

export const zRequiredString = (label = 'Field') =>
	z.string().min(1, `${label} wajib diisi`);

export const zOptionalString = z.string().optional().nullable();

export const zPositiveInt = z
	.number()
	.int('Harus bilangan bulat')
	.positive('Harus lebih dari 0');

export const zUrlOptional = z
	.string()
	.url('URL tidak valid')
	.optional()
	.or(z.literal(''));

export const zDateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

export const zEmailOptional = z.string().email('Email tidak valid').optional().or(z.literal(''));
