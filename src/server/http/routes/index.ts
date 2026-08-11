import { Hono } from 'hono';
import { authRoutes } from './auth.routes';
import { usersRoutes } from './users.routes';
import { rolesRoutes } from './roles.routes';
import { notificationRoutes } from './notification.routes';
import { uploadRoutes } from './upload.routes';
import { articlesRoutes } from './articles.routes';
import { settingsRoutes } from './settings.routes';

// Mount routes (chained so the type accumulates for Hono RPC client inference)
export const apiRoutes = new Hono()
	.route('/auths', authRoutes)
	.route('/users', usersRoutes)
	.route('/roles', rolesRoutes)
	.route('/notifications', notificationRoutes)
	.route('/uploads', uploadRoutes)
	.route('/articles', articlesRoutes)
	.route('/settings', settingsRoutes);

export { authRoutes, usersRoutes, rolesRoutes, notificationRoutes, uploadRoutes, articlesRoutes, settingsRoutes };
