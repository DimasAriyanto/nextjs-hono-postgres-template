export interface UploadResult {
	url: string;
	path: string;
	filename: string;
	size: number;
	mimeType: string;
}

export interface StorageProvider {
	/**
	 * @param ext Server-derived extension (no leading dot, e.g. "png") — never trust
	 * the client-supplied filename for this, see upload-policy.ts.
	 */
	upload(file: File, folder: string, ext: string): Promise<UploadResult>;
	delete(path: string): Promise<void>;
	getUrl(path: string): string;
}
