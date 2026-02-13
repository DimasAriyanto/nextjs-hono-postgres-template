import fs from 'fs/promises';
import path from 'path';
import { StorageProvider, UploadResult } from './storage.interface';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export class LocalStorageProvider implements StorageProvider {
	async upload(file: File, folder: string): Promise<UploadResult> {
		const dir = path.join(UPLOAD_DIR, folder);
		await fs.mkdir(dir, { recursive: true });

		const ext = path.extname(file.name);
		const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
		const filePath = path.join(dir, filename);

		const buffer = Buffer.from(await file.arrayBuffer());
		await fs.writeFile(filePath, buffer);

		const storagePath = `${folder}/${filename}`;
		const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

		return {
			url: `${appUrl}/uploads/${storagePath}`,
			path: storagePath,
			filename,
			size: file.size,
			mimeType: file.type,
		};
	}

	async delete(storagePath: string): Promise<void> {
		const filePath = path.join(UPLOAD_DIR, storagePath);
		await fs.unlink(filePath);
	}

	getUrl(storagePath: string): string {
		const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
		return `${appUrl}/uploads/${storagePath}`;
	}
}
