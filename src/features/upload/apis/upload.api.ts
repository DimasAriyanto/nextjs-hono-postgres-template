import { ApiError } from '@/libs/api';
import type { ApiSuccessResponse } from '@/types/api-response';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadImageParams {
	file: File;
	folder: string;
}

interface UploadResponse {
	url: string;
	filename: string;
	size: number;
	mimetype: string;
}

// ── Upload Image API ──────────────────────────────────────────────────────────

/**
 * POST /api/v1/uploads/image
 * Upload image file to server
 */
export async function uploadImage(params: UploadImageParams): Promise<ApiSuccessResponse<UploadResponse>> {
	const formData = new FormData();
	formData.append('file', params.file);
	formData.append('folder', params.folder);

	// Use native fetch for file upload (better than RPC for FormData)
	const res = await fetch('/api/v1/uploads/image', {
		method: 'POST',
		body: formData,
		credentials: 'include', // Include authentication cookies
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		const message = errorData?.message || 'Failed to upload image';
		const code = errorData?.errors?.code || 'UPLOAD_ERROR';
		const type = errorData?.errors?.type || 'UploadError';
		const details = errorData?.errors?.details;
		throw new ApiError(message, res.status, code, type, details);
	}

	return res.json();
}

// ── Upload Video API ──────────────────────────────────────────────────────────

/**
 * POST /api/v1/uploads/video
 * Upload video file to server
 */
export async function uploadVideo(params: UploadImageParams): Promise<ApiSuccessResponse<UploadResponse>> {
	const formData = new FormData();
	formData.append('file', params.file);
	formData.append('folder', params.folder);

	// Use native fetch for file upload (better than RPC for FormData)
	const res = await fetch('/api/v1/uploads/video', {
		method: 'POST',
		body: formData,
		credentials: 'include', // Include authentication cookies
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		const message = errorData?.message || 'Failed to upload video';
		const code = errorData?.errors?.code || 'UPLOAD_ERROR';
		const type = errorData?.errors?.type || 'UploadError';
		const details = errorData?.errors?.details;
		throw new ApiError(message, res.status, code, type, details);
	}

	return res.json();
}

// ── Upload Document API ───────────────────────────────────────────────────────

/**
 * POST /api/v1/uploads/document
 * Upload document file to server
 */
export async function uploadDocument(params: UploadImageParams): Promise<ApiSuccessResponse<UploadResponse>> {
	const formData = new FormData();
	formData.append('file', params.file);
	formData.append('folder', params.folder);

	// Use native fetch for file upload
	const res = await fetch('/api/v1/uploads/document', {
		method: 'POST',
		body: formData,
		credentials: 'include', // Include authentication cookies
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		const message = errorData?.message || 'Failed to upload document';
		const code = errorData?.errors?.code || 'UPLOAD_ERROR';
		const type = errorData?.errors?.type || 'UploadError';
		const details = errorData?.errors?.details;
		throw new ApiError(message, res.status, code, type, details);
	}

	return res.json();
}

// Re-export ApiError for error handling
export { ApiError };