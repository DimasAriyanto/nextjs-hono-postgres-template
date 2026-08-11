import { Hono } from 'hono';
import { settingsController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { updateSettingRequest } from '@/server/http/validators/settings.validator';

export const settingsRoutes = new Hono()
	.use(auth)
	.get('/', settingsController.show)
	.put('/', updateSettingRequest, settingsController.update);
