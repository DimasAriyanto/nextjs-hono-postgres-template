import { Hono } from 'hono';
import { currencyController } from '../controllers';
import { auth } from '@/server/http/middlewares/auth';
import { rateLimit } from '@/server/http/middlewares/rate-limit';
import { convertCurrencyRequest } from '@/server/http/validators/currency.validator';

export const currencyRoutes = new Hono()
	.get('/convert', auth, rateLimit({ windowSeconds: 60, max: 30 }), convertCurrencyRequest, currencyController.convert);
