import { Hono } from 'hono';
import { usersController } from '../controllers';

export const usersRoutes = new Hono();

// User CRUD routes
usersRoutes.get('/', usersController.index);
usersRoutes.get('/:id', usersController.show);
usersRoutes.get('/:id/roles', usersController.showWithRoles);
usersRoutes.post('/', usersController.create);
usersRoutes.put('/:id', usersController.update);
usersRoutes.delete('/:id', usersController.delete);

// User role management routes
usersRoutes.post('/:id/roles', usersController.assignRole);
usersRoutes.delete('/:id/roles/:roleId', usersController.removeRole);
