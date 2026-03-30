import { createNotificationSchema, notificationSearchSchema } from '@/contracts/notification';
import { validateJson, validateQuery, validateParam } from './helper';
import { z } from 'zod';

export const createNotificationRequest = validateJson(createNotificationSchema);
export const searchNotificationsRequest = validateQuery(notificationSearchSchema);
export const notificationIdParam = validateParam(z.object({ id: z.string().uuid('Invalid notification ID') }));
