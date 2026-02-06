import { Hono } from 'hono';
import { authController } from '../controllers';
import { loginRequest, registerRequest } from '@/server/http/validators/auths.validator';
import { auth } from '@/server/http/middlewares/auth';

export const authRoutes = new Hono();

// Auth routes
authRoutes.post('/login', loginRequest, authController.login);
authRoutes.post('/register', registerRequest, authController.register);
authRoutes.get('/profile', auth, authController.profile);
authRoutes.get('/signout', authController.signout);

// Email verification routes
authRoutes.get('/verify-email', authController.verifyEmail);
authRoutes.post('/resend-verification', auth, authController.resendVerification);
