import { v2 as cloudinary } from 'cloudinary';
import { StorageProvider, UploadResult } from './storage.interface';

export class CloudinaryStorageProvider implements StorageProvider {
	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
			api_key: process.env.CLOUDINARY_API_KEY ?? '',
			api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
			secure: true,
		});
	}

	async upload(file: File, folder: string): Promise<UploadResult> {
		const ext = file.name.split('.').pop();
		const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const buffer = Buffer.from(await file.arrayBuffer());

		const result = await new Promise<{
			public_id: string;
			secure_url: string;
		}>((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder,
					public_id: filename,
					resource_type: 'auto',
				},
				(error, result) => {
					if (error || !result) {
						reject(error ?? new Error('Cloudinary upload failed'));
						return;
					}
					resolve(result);
				}
			);
			uploadStream.end(buffer);
		});

		return {
			url: result.secure_url,
			path: result.public_id,
			filename: `${filename}${ext ? `.${ext}` : ''}`,
			size: file.size,
			mimeType: file.type,
		};
	}

	async delete(storagePath: string): Promise<void> {
		// public_id alone doesn't tell us the resource type, so try each in turn
		const resourceTypes = ['image', 'video', 'raw'] as const;

		for (const resource_type of resourceTypes) {
			const result = await cloudinary.uploader.destroy(storagePath, {
				resource_type,
				invalidate: true,
			});
			if (result.result === 'ok') return;
		}
	}

	getUrl(storagePath: string): string {
		return cloudinary.url(storagePath, { secure: true });
	}
}
