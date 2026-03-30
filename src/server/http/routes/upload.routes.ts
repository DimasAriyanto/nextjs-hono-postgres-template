import { Hono } from 'hono';
import { uploadController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';

export const uploadRoutes = new Hono()
	.use(auth)
	.post('/image', uploadController.image);
