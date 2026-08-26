import { Hono } from 'hono';
import { authController } from '../controllers';
import { loginRequest, registerRequest, forgotPasswordRequest, resetPasswordRequest, googleAuthRequest, updateProfileRequest, changePasswordRequest } from '@/server/http/validators/auths.validator';
import { auth } from '@/server/http/middlewares/auth';
import { rateLimit } from '@/server/http/middlewares/rate-limit';
import { turnstileVerify } from '@/server/http/middlewares/turnstile';

// Credential-guessing endpoints: tight limits
const strictRateLimit = rateLimit({ windowSeconds: 60, max: 5 });
// Lower-risk / self-service endpoints: looser limits
const looseRateLimit = rateLimit({ windowSeconds: 60, max: 20 });

export const authRoutes = new Hono()
	.post('/login', turnstileVerify, strictRateLimit, loginRequest, authController.login)
	.post('/register', turnstileVerify, strictRateLimit, registerRequest, authController.register)
	.post('/google', strictRateLimit, googleAuthRequest, authController.googleAuth)
	.post('/refresh', looseRateLimit, authController.refresh)
	.get('/profile', auth, authController.profile)
	.get('/signout', authController.signout)
	.get('/verify-email', authController.verifyEmail)
	.post('/forgot-password', turnstileVerify, strictRateLimit, forgotPasswordRequest, authController.forgotPassword)
	.post('/reset-password', strictRateLimit, resetPasswordRequest, authController.resetPassword)
	.post('/resend-verification', auth, strictRateLimit, authController.resendVerification)
	.put('/profile', auth, updateProfileRequest, authController.updateProfile)
	.put('/password', auth, changePasswordRequest, authController.changePassword)
	.delete('/account', auth, authController.deleteAccount);
