export interface UploadResult {
	url: string;
	path: string;
	filename: string;
	size: number;
	mimeType: string;
}

export interface StorageProvider {
	upload(file: File, folder: string): Promise<UploadResult>;
	delete(path: string): Promise<void>;
	getUrl(path: string): string;
}
