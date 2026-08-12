import { Hono } from 'hono';
import { settingsController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { updateSettingRequest } from '@/server/http/validators/settings.validator';

export const settingsRoutes = new Hono()
	.get('/', settingsController.show)
	.put('/', auth, updateSettingRequest, settingsController.update);
