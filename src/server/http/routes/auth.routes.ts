import { Hono } from 'hono';
import { authController } from '../controllers';
import { loginRequest, registerRequest, forgotPasswordRequest, resetPasswordRequest, googleAuthRequest, updateProfileRequest, changePasswordRequest } from '@/server/http/validators/auths.validator';
import { auth } from '@/server/http/middlewares/auth';

export const authRoutes = new Hono()
	.post('/login', loginRequest, authController.login)
	.post('/register', registerRequest, authController.register)
	.post('/google', googleAuthRequest, authController.googleAuth)
	.get('/profile', auth, authController.profile)
	.get('/signout', authController.signout)
	.get('/verify-email', authController.verifyEmail)
	.post('/forgot-password', forgotPasswordRequest, authController.forgotPassword)
	.post('/reset-password', resetPasswordRequest, authController.resetPassword)
	.post('/resend-verification', auth, authController.resendVerification)
	.put('/profile', auth, updateProfileRequest, authController.updateProfile)
	.put('/password', auth, changePasswordRequest, authController.changePassword)
	.delete('/account', auth, authController.deleteAccount);
