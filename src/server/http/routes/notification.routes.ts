import { Hono } from 'hono';
import { notificationController } from '../controllers/notification.controller';
import { createNotificationRequest, notificationIdParam } from '../validators/notifications.validator';
import { auth } from '@/server/http/middlewares/auth';

export const notificationRoutes = new Hono()
	.use(auth)
	.get('/', notificationController.index)
	.get('/unread', notificationController.unread)
	.get('/:id', notificationIdParam, notificationController.show)
	.post('/', createNotificationRequest, notificationController.create)
	.put('/read-all', notificationController.markAllAsRead)
	.put('/:id/read', notificationIdParam, notificationController.markAsRead)
	.delete('/:id', notificationIdParam, notificationController.destroy);
