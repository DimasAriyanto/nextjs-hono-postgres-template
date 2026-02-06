import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { ValidationError } from '@/server/errors';

/**
 * Transform Zod errors to field-based error object
 */
function formatZodErrors(error: { issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> }): Record<string, string[]> {
	const fields: Record<string, string[]> = {};
	for (const issue of error.issues) {
		const path = issue.path.map(String).join('.') || 'root';
		if (!fields[path]) {
			fields[path] = [];
		}
		fields[path].push(issue.message);
	}
	return fields;
}

const loginSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email format'),
	password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email format'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	password_confirmation: z.string().min(1, 'Password confirmation is required'),
	title: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
	message: 'Passwords do not match',
	path: ['password_confirmation'],
});

export const loginRequest = zValidator('json', loginSchema, (result) => {
	if (!result.success) {
		throw new ValidationError('Validation failed', formatZodErrors(result.error));
	}
});

export const registerRequest = zValidator('json', registerSchema, (result) => {
	if (!result.success) {
		throw new ValidationError('Validation failed', formatZodErrors(result.error));
	}
});
