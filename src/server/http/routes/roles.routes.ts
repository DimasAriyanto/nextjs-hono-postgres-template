import { Hono } from 'hono';
import { rolesController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';

const requireView = checkPermission('menu.role.view');
const requireManage = checkPermission('menu.role.manage');

export const rolesRoutes = new Hono()
	.use(auth)
	.get('/', requireView, rolesController.index)
	.get('/:id', requireView, rolesController.show)
	.get('/:id/users', requireView, rolesController.showWithUsers)
	.get('/:id/permissions', requireView, rolesController.showWithPermissions)
	.post('/', requireManage, rolesController.create)
	.put('/:id', requireManage, rolesController.update)
	.delete('/:id', requireManage, rolesController.delete)
	.post('/:id/permissions', requireManage, rolesController.assignPermission)
	.delete('/:id/permissions/:permissionId', requireManage, rolesController.removePermission);
