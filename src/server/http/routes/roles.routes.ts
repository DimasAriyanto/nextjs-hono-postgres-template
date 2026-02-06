import { Hono } from 'hono';
import { rolesController } from '../controllers';

export const rolesRoutes = new Hono();

// Role CRUD routes
rolesRoutes.get('/', rolesController.index);
rolesRoutes.get('/:id', rolesController.show);
rolesRoutes.get('/:id/users', rolesController.showWithUsers);
rolesRoutes.get('/:id/permissions', rolesController.showWithPermissions);
rolesRoutes.post('/', rolesController.create);
rolesRoutes.put('/:id', rolesController.update);
rolesRoutes.delete('/:id', rolesController.delete);

// Role permission management routes
rolesRoutes.post('/:id/permissions', rolesController.assignPermission);
rolesRoutes.delete('/:id/permissions/:permissionId', rolesController.removePermission);
