import { Hono } from 'hono';
import { authRoutes } from './auth.routes';
import { usersRoutes } from './users.routes';
import { rolesRoutes } from './roles.routes';
import { permissionsRoutes } from './permissions.routes';
import { notificationRoutes } from './notification.routes';
import { uploadRoutes } from './upload.routes';
import { articlesRoutes } from './articles.routes';
import { articleCategoriesRoutes } from './article-categories.routes';
import { galleriesRoutes } from './galleries.routes';
import { settingsRoutes } from './settings.routes';
import { currencyRoutes } from './currency.routes';

// Mount routes (chained so the type accumulates for Hono RPC client inference)
export const apiRoutes = new Hono()
	.route('/auths', authRoutes)
	.route('/users', usersRoutes)
	.route('/roles', rolesRoutes)
	.route('/permissions', permissionsRoutes)
	.route('/notifications', notificationRoutes)
	.route('/uploads', uploadRoutes)
	.route('/articles', articlesRoutes)
	.route('/article-categories', articleCategoriesRoutes)
	.route('/galleries', galleriesRoutes)
	.route('/settings', settingsRoutes)
	.route('/currency', currencyRoutes);

export { authRoutes, usersRoutes, rolesRoutes, permissionsRoutes, notificationRoutes, uploadRoutes, articlesRoutes, articleCategoriesRoutes, galleriesRoutes, settingsRoutes, currencyRoutes };
