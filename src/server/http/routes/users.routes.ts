import { Hono } from 'hono';
import { usersController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';

const requireView = checkPermission('menu.user.view');
const requireManage = checkPermission('menu.user.manage');

export const usersRoutes = new Hono()
	.use(auth)
	.get('/', requireView, usersController.index)
	.get('/:id', requireView, usersController.show)
	.get('/:id/roles', requireView, usersController.showWithRoles)
	.post('/', requireManage, usersController.create)
	.put('/:id', requireManage, usersController.update)
	.delete('/:id', requireManage, usersController.delete)
	.post('/:id/roles', requireManage, usersController.assignRole)
	.delete('/:id/roles/:roleId', requireManage, usersController.removeRole);
