import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const loginSchema = z.object({
	email: z.string().min(1, 'Please provide with email!').email(),
	password: z.string().min(1, 'Please provide with password!'),
});

const registerSchema = z.object({
	email: z.string().min(1, 'Please provide with email!').email(),
	password: z.string().min(6, 'Password must be at least 6 characters!'),
	password_confirmation: z.string().min(1, 'Please confirm your password!'),
	title: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
	message: 'Passwords do not match!',
	path: ['password_confirmation'],
});

export const loginRequest = zValidator('json', loginSchema, (result) => {
	if (!result.success) {
		throw new HTTPException(400, {
			message: `An invalid request error occurred! [ERROR]: ${JSON.stringify(result.error.stack)}`,
		});
	}
});

export const registerRequest = zValidator('json', registerSchema, (result) => {
	if (!result.success) {
		throw new HTTPException(400, {
			message: `An invalid request error occurred! [ERROR]: ${JSON.stringify(result.error.stack)}`,
		});
	}
});
