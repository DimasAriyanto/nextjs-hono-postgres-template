import { Hono } from 'hono';
import { authRoutes } from './auth.routes';
import { usersRoutes } from './users.routes';
import { rolesRoutes } from './roles.routes';

export const apiRoutes = new Hono();

// Mount routes
apiRoutes.route('/auths', authRoutes);
apiRoutes.route('/users', usersRoutes);
apiRoutes.route('/roles', rolesRoutes);

export { authRoutes, usersRoutes, rolesRoutes };
