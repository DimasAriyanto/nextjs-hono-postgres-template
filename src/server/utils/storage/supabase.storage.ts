import { createClient } from '@supabase/supabase-js';
import { StorageProvider, UploadResult } from './storage.interface';

export class SupabaseStorageProvider implements StorageProvider {
	private bucket: string;
	private supabaseUrl: string;

	constructor() {
		this.supabaseUrl = process.env.SUPABASE_URL ?? '';
		this.bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'uploads';
	}

	private get client() {
		return createClient(
			this.supabaseUrl,
			process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
		);
	}

	async upload(file: File, folder: string): Promise<UploadResult> {
		const ext = file.name.split('.').pop();
		const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
		const storagePath = `${folder}/${filename}`;

		const buffer = Buffer.from(await file.arrayBuffer());

		const { error } = await this.client.storage
			.from(this.bucket)
			.upload(storagePath, buffer, {
				contentType: file.type,
				upsert: false,
			});

		if (error) {
			throw new Error(`Supabase upload failed: ${error.message}`);
		}

		const url = this.getUrl(storagePath);

		return {
			url,
			path: storagePath,
			filename,
			size: file.size,
			mimeType: file.type,
		};
	}

	async delete(storagePath: string): Promise<void> {
		const { error } = await this.client.storage
			.from(this.bucket)
			.remove([storagePath]);

		if (error) {
			throw new Error(`Supabase delete failed: ${error.message}`);
		}
	}

	getUrl(storagePath: string): string {
		return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${storagePath}`;
	}
}
