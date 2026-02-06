import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Pagination metadata
 */
export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

/**
 * Standard API response structure
 */
export interface ApiSuccessResponse<T = unknown> {
	success: true;
	message: string;
	data: T;
	meta?: {
		pagination?: PaginationMeta;
	};
}

/**
 * Response helper for controllers
 */
export const response = {
	/**
	 * Success response with data
	 */
	ok<T>(c: Context, data: T, message = 'OK', status: ContentfulStatusCode = 200) {
		return c.json<ApiSuccessResponse<T>>(
			{
				success: true,
				message,
				data,
			},
			status
		);
	},

	/**
	 * Created response (201)
	 */
	created<T>(c: Context, data: T, message = 'Created successfully') {
		return c.json<ApiSuccessResponse<T>>(
			{
				success: true,
				message,
				data,
			},
			201
		);
	},

	/**
	 * Success response with pagination
	 */
	paginated<T>(
		c: Context,
		data: T[],
		pagination: PaginationMeta,
		message = 'OK'
	) {
		return c.json<ApiSuccessResponse<T[]>>(
			{
				success: true,
				message,
				data,
				meta: {
					pagination,
				},
			},
			200
		);
	},

	/**
	 * Success response without data (for delete, etc)
	 */
	success(c: Context, message = 'OK') {
		return c.json<ApiSuccessResponse<null>>(
			{
				success: true,
				message,
				data: null,
			},
			200
		);
	},
};

/**
 * Helper to extract pagination params from request
 */
export function getPaginationParams(c: Context) {
	const page = Math.max(1, Number(c.req.query('page')) || 1);
	const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 10));
	const search = c.req.query('search') || undefined;

	return { page, limit, search };
}

/**
 * Helper to create pagination meta from service result
 */
export function createPaginationMeta(
	page: number,
	limit: number,
	total: number
): PaginationMeta {
	return {
		page,
		limit,
		total,
		totalPages: Math.ceil(total / limit),
	};
}
