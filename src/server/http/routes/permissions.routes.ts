import { Hono } from 'hono';
import { permissionsController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';

export const permissionsRoutes = new Hono()
	.use(auth)
	.use(checkPermission('menu.role.manage'))
	.get('/', permissionsController.index);
