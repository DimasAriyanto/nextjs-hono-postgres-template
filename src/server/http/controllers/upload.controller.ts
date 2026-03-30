import { Context } from 'hono';
import { getStorage } from '@/server/utils/storage';
import { response } from '@/server/http/response';
import { ValidationError } from '@/server/errors';

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

		const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
		if (file.size > MAX_SIZE) {
			throw new ValidationError('Validation failed', { file: ['File size must be less than 5 MB'] });
		}

		const storage = getStorage();
		const result = await storage.upload(file, folder);

		return response.ok(c, { url: result.url, path: result.path }, 'Upload successful');
	},
};
