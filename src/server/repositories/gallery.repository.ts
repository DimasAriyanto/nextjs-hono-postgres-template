import { eq, ilike } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { GalleriesTable, type TSelectGallery, type TInsertGallery } from '@/server/databases/schemas/galleries.schema';

function buildFilter(search?: string) {
	if (!search) return undefined;
	return ilike(GalleriesTable.filename, `%${search}%`);
}

export class GalleryRepository {
	/**
	 * Find all gallery images with pagination and filename search
	 */
	async findAll(options?: { page?: number; limit?: number; search?: string }) {
		const { page = 1, limit = 10, search } = options || {};

		return db.query.GalleriesTable.findMany({
			where: buildFilter(search),
			orderBy: (galleries, { desc }) => [desc(galleries.created_at)],
			limit,
			offset: (page - 1) * limit,
		});
	}

	/**
	 * Find gallery image by ID
	 */
	async findById(id: string): Promise<TSelectGallery | undefined> {
		const [item] = await db.select().from(GalleriesTable).where(eq(GalleriesTable.id, id)).limit(1);

		return item;
	}

	/**
	 * Create new gallery image
	 */
	async create(data: TInsertGallery): Promise<TSelectGallery> {
		const [item] = await db.insert(GalleriesTable).values(data).returning();

		return item;
	}

	/**
	 * Delete gallery image by ID
	 */
	async delete(id: string): Promise<boolean> {
		const result = await db.delete(GalleriesTable).where(eq(GalleriesTable.id, id)).returning({ id: GalleriesTable.id });

		return result.length > 0;
	}

	/**
	 * Count total gallery images matching filename search
	 */
	async count(search?: string): Promise<number> {
		let query = db.select().from(GalleriesTable).$dynamic();

		const filter = buildFilter(search);
		if (filter) {
			query = query.where(filter);
		}

		const result = await query;
		return result.length;
	}
}

export const galleryRepository = new GalleryRepository();
