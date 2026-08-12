import { Hono } from 'hono';
import { settingsController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { checkPermission } from '@/server/http/middlewares/permission';
import { updateSettingRequest } from '@/server/http/validators/settings.validator';

export const settingsRoutes = new Hono()
	.get('/', settingsController.show)
	.put('/', auth, checkPermission('menu.settings.manage'), updateSettingRequest, settingsController.update);
