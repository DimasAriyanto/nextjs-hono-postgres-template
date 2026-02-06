import { Hono } from 'hono';
import { usersController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';

export const usersRoutes = new Hono()
	.use(auth)
	.get('/', usersController.index)
	.get('/:id', usersController.show)
	.get('/:id/roles', usersController.showWithRoles)
	.post('/', usersController.create)
	.put('/:id', usersController.update)
	.delete('/:id', usersController.delete)
	.post('/:id/roles', usersController.assignRole)
	.delete('/:id/roles/:roleId', usersController.removeRole);
