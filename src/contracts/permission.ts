import { z } from 'zod';

// ============================================
// RESPONSE SCHEMAS
// ============================================

/**
 * Permission response
 */
export const permissionSchema = z.object({
	id: z.string(),
	name: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export type TPermission = z.infer<typeof permissionSchema>;
