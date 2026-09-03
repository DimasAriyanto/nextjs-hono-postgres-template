import { Context } from 'hono';
import { galleryService } from '@/server/services';
import { response, getPaginationParams } from '@/server/http/response';

export const galleriesController = {
	/**
	 * GET /galleries/public
	 * Get gallery images with pagination — public, no auth required
	 */
	async publicIndex(c: Context) {
		const { page, limit, search } = getPaginationParams(c);

		const result = await galleryService.getAllGalleries({ page, limit, search });

		return response.paginated(c, result.data, {
			page: result.meta.page,
			limit: result.meta.limit,
			total: result.meta.total,
			totalPages: result.meta.pages,
		}, 'OK');
	},

	/**
	 * GET /galleries
	 * Get all gallery images with pagination
	 */
	async index(c: Context) {
		const { page, limit, search } = getPaginationParams(c);

		const result = await galleryService.getAllGalleries({ page, limit, search });

		return response.paginated(c, result.data, {
			page: result.meta.page,
			limit: result.meta.limit,
			total: result.meta.total,
			totalPages: result.meta.pages,
		}, 'OK');
	},

	/**
	 * POST /galleries
	 * Add an already-uploaded file to the gallery
	 */
	async create(c: Context) {
		const body = await c.req.json();
		const payload = c.get('user') as { auid: string };

		const item = await galleryService.createGalleryItem({
			...body,
			created_by: payload.auid,
		});

		return response.created(c, item, 'Image added to gallery successfully');
	},

	/**
	 * DELETE /galleries/:id
	 * Delete gallery image
	 */
	async delete(c: Context) {
		const id = c.req.param('id') as string;
		await galleryService.deleteGalleryItem(id);

		return response.success(c, 'Gallery image deleted successfully');
	},
};
