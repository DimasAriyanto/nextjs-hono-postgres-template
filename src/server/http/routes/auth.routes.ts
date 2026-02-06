import { Hono } from 'hono';
import { authController } from '../controllers';
import { loginRequest, registerRequest } from '@/server/http/validators/auths.validator';
import { auth } from '@/server/http/middlewares/auth';

export const authRoutes = new Hono()
	.post('/login', loginRequest, authController.login)
	.post('/register', registerRequest, authController.register)
	.get('/profile', auth, authController.profile)
	.get('/signout', authController.signout)
	.get('/verify-email', authController.verifyEmail)
	.post('/resend-verification', auth, authController.resendVerification);
