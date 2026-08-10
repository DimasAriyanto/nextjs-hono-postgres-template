import { useMutation } from '@tanstack/react-query';
import * as uploadApi from '@/features/upload/apis/upload.api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadParams {
	file: File;
	folder: string;
}

// ── Upload Image Hook ─────────────────────────────────────────────────────────

/**
 * Hook for upload image mutation
 */
export function useUploadImage(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	return useMutation({
		mutationFn: (params: UploadParams) => uploadApi.uploadImage(params),
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
}

// ── Upload Document Hook ──────────────────────────────────────────────────────

/**
 * Hook for upload document mutation
 */
export function useUploadDocument(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
	return useMutation({
		mutationFn: (params: UploadParams) => uploadApi.uploadDocument(params),
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
}