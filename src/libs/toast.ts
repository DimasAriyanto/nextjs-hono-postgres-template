import { toast } from 'sonner';
import { ApiError } from '@/libs/api';

/**
 * Message to display for a caught error — the API's own message for an
 * `ApiError`, otherwise a generic fallback (e.g. for a form's local error state).
 */
export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
	return err instanceof ApiError ? err.message : fallback;
}

/**
 * Toasts a create/update mutation failure caught from `mutateAsync`, using the
 * API's message when available and a generic one otherwise.
 */
export function toastMutationError(err: unknown) {
	if (err instanceof ApiError) {
		toast.error('Failed', { description: err.message });
	} else {
		toast.error('Something went wrong', { description: 'An error occurred. Please try again.' });
	}
}

/**
 * Toasts a delete mutation failure caught from `mutateAsync`.
 */
export function toastDeleteError(entity: string) {
	toast.error('Delete failed', { description: `Failed to delete the ${entity}. Please try again.` });
}

/**
 * Toasts a file upload failure.
 */
export function toastUploadError(err: unknown, what: string) {
	toast.error('Upload failed', { description: err instanceof Error ? err.message : `Failed to upload ${what}` });
}
