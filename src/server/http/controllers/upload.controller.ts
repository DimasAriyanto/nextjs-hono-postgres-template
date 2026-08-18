import { Context } from 'hono';
import { getStorage } from '@/server/utils/storage';
import { response } from '@/server/http/response';
import { ValidationError } from '@/server/errors';

const DEFAULT_MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB
const DEFAULT_DOCUMENT_MIME_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'text/plain',
	'text/csv',
];

// Overridable via env so limits can differ per environment without a code change
const MAX_IMAGE_SIZE = Number(process.env.UPLOAD_MAX_IMAGE_SIZE) || DEFAULT_MAX_IMAGE_SIZE;
const MAX_DOCUMENT_SIZE = Number(process.env.UPLOAD_MAX_DOCUMENT_SIZE) || DEFAULT_MAX_DOCUMENT_SIZE;
const DOCUMENT_MIME_TYPES = process.env.UPLOAD_ALLOWED_DOCUMENT_TYPES
	? process.env.UPLOAD_ALLOWED_DOCUMENT_TYPES.split(',').map((t) => t.trim())
	: DEFAULT_DOCUMENT_MIME_TYPES;

function formatMB(bytes: number): string {
	return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)} MB`;
}

export const uploadController = {
	/**
	 * POST /uploads/image
	 * Upload a single image file, returns URL via the configured storage driver
	 */
	async image(c: Context) {
		const formData = await c.req.formData();
		const file = formData.get('file');
		const folder = (formData.get('folder') as string | null) ?? 'uploads';

		if (!file || !(file instanceof File)) {
			throw new ValidationError('Validation failed', { file: ['File is required'] });
		}

		if (!file.type.startsWith('image/')) {
			throw new ValidationError('Validation failed', { file: ['Only image files are allowed'] });
		}

		if (file.size > MAX_IMAGE_SIZE) {
			throw new ValidationError('Validation failed', { file: [`File size must be less than ${formatMB(MAX_IMAGE_SIZE)}`] });
		}

		const storage = getStorage();
		const result = await storage.upload(file, folder);

		return response.ok(c, { url: result.url, path: result.path }, 'Upload successful');
	},

	/**
	 * POST /uploads/document
	 * Upload a single document file (PDF, Word, Excel, PowerPoint, plain text/CSV),
	 * returns URL via the configured storage driver
	 */
	async document(c: Context) {
		const formData = await c.req.formData();
		const file = formData.get('file');
		const folder = (formData.get('folder') as string | null) ?? 'uploads';

		if (!file || !(file instanceof File)) {
			throw new ValidationError('Validation failed', { file: ['File is required'] });
		}

		if (!DOCUMENT_MIME_TYPES.includes(file.type)) {
			throw new ValidationError('Validation failed', { file: ['Only PDF, Word, Excel, PowerPoint, text or CSV files are allowed'] });
		}

		if (file.size > MAX_DOCUMENT_SIZE) {
			throw new ValidationError('Validation failed', { file: [`File size must be less than ${formatMB(MAX_DOCUMENT_SIZE)}`] });
		}

		const storage = getStorage();
		const result = await storage.upload(file, folder);

		return response.ok(c, { url: result.url, path: result.path }, 'Upload successful');
	},
};
