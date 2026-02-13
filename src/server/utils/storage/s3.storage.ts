import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageProvider, UploadResult } from './storage.interface';

export class S3StorageProvider implements StorageProvider {
	private client: S3Client;
	private bucket: string;
	private region: string;

	constructor() {
		this.region = process.env.AWS_REGION ?? 'ap-southeast-1';
		this.bucket = process.env.AWS_S3_BUCKET ?? '';

		this.client = new S3Client({
			region: this.region,
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
			},
		});
	}

	async upload(file: File, folder: string): Promise<UploadResult> {
		const ext = file.name.split('.').pop();
		const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
		const key = `${folder}/${filename}`;

		const buffer = Buffer.from(await file.arrayBuffer());

		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: buffer,
				ContentType: file.type,
				ContentLength: file.size,
			})
		);

		const url = this.getUrl(key);

		return {
			url,
			path: key,
			filename,
			size: file.size,
			mimeType: file.type,
		};
	}

	async delete(storagePath: string): Promise<void> {
		await this.client.send(
			new DeleteObjectCommand({
				Bucket: this.bucket,
				Key: storagePath,
			})
		);
	}

	getUrl(storagePath: string): string {
		const customDomain = process.env.AWS_S3_CUSTOM_DOMAIN;
		if (customDomain) {
			return `https://${customDomain}/${storagePath}`;
		}
		return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${storagePath}`;
	}
}
