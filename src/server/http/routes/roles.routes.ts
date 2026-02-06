import { Hono } from 'hono';
import { rolesController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';

export const rolesRoutes = new Hono()
	.use(auth)
	.get('/', rolesController.index)
	.get('/:id', rolesController.show)
	.get('/:id/users', rolesController.showWithUsers)
	.get('/:id/permissions', rolesController.showWithPermissions)
	.post('/', rolesController.create)
	.put('/:id', rolesController.update)
	.delete('/:id', rolesController.delete)
	.post('/:id/permissions', rolesController.assignPermission)
	.delete('/:id/permissions/:permissionId', rolesController.removePermission);
