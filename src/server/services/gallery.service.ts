import { NotFoundError, InternalError } from '@/server/errors';
import { galleryRepository } from '@/server/repositories';
import { getStorage } from '@/server/utils/storage';
import type { TInsertGallery } from '@/server/databases/schemas/galleries.schema';

export class GalleryService {
	/**
	 * Get all gallery images with pagination
	 */
	async getAllGalleries(options?: { page?: number; limit?: number; search?: string }) {
		const { page = 1, limit = 10, search } = options || {};

		const items = await galleryRepository.findAll({ page, limit, search });
		const total = await galleryRepository.count(search);

		return {
			data: items,
			meta: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Add an already-uploaded file to the gallery
	 */
	async createGalleryItem(data: {
		url: string;
		path: string;
		filename: string;
		size: number;
		mime_type: string;
		alt_text?: string;
		created_by?: string;
	}) {
		const insertData: TInsertGallery = {
			url: data.url,
			path: data.path,
			filename: data.filename,
			size: data.size,
			mime_type: data.mime_type,
			alt_text: data.alt_text,
			created_by: data.created_by,
		};

		return galleryRepository.create(insertData);
	}

	/**
	 * Delete a gallery image — removes the stored file first, then the record
	 */
	async deleteGalleryItem(id: string) {
		const existing = await galleryRepository.findById(id);
		if (!existing) {
			throw new NotFoundError('Gallery image');
		}

		try {
			await getStorage().delete(existing.path);
		} catch {
			// File may already be gone from storage — don't block removing the record
		}

		const deleted = await galleryRepository.delete(id);
		if (!deleted) {
			throw new InternalError('Failed to delete gallery image');
		}

		return { message: 'Gallery image deleted successfully' };
	}
}

export const galleryService = new GalleryService();
