import { z } from 'zod';

export const NotificationType = {
	SYSTEM: 'system',
	INFO: 'info',
	WARNING: 'warning',
	SUCCESS: 'success',
	ERROR: 'error',
} as const;

export type TNotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ============================================
// REQUEST SCHEMAS
// ============================================

export const createNotificationSchema = z.object({
	recipient_id: z.string().uuid('Invalid recipient ID'),
	type: z.enum(['system', 'info', 'warning', 'success', 'error']).default('info'),
	title: z.string().min(1, 'Title is required'),
	message: z.string().min(1, 'Message is required'),
});

export type TCreateNotificationRequest = z.infer<typeof createNotificationSchema>;

export const notificationSearchSchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
	is_read: z.enum(['true', 'false']).optional(),
});

export type TNotificationSearch = z.infer<typeof notificationSearchSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const notificationSchema = z.object({
	id: z.string(),
	recipient_id: z.string(),
	type: z.enum(['system', 'info', 'warning', 'success', 'error']),
	title: z.string(),
	message: z.string(),
	is_read: z.boolean(),
	read_at: z.string().nullable().optional(),
	created_at: z.string(),
});

export type TNotification = z.infer<typeof notificationSchema>;
