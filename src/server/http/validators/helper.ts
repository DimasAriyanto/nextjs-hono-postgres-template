import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { ValidationError } from '@/server/errors';

type ValidationTarget = 'json' | 'query' | 'param' | 'header' | 'cookie' | 'form';

/**
 * Transform Zod errors to field-based error object
 */
function formatZodErrors(
	error: { issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> }
): Record<string, string[]> {
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

/**
 * Create a Hono validator middleware from a Zod schema
 * Throws ValidationError with field-based errors on failure
 */
export function validate<T extends z.ZodType>(
	target: ValidationTarget,
	schema: T
) {
	return zValidator(target, schema, (result) => {
		if (!result.success) {
			throw new ValidationError('Validation failed', formatZodErrors(result.error));
		}
	});
}

/**
 * Shorthand validators for common targets
 */
export const validateJson = <T extends z.ZodType>(schema: T) => validate('json', schema);
export const validateQuery = <T extends z.ZodType>(schema: T) => validate('query', schema);
export const validateParam = <T extends z.ZodType>(schema: T) => validate('param', schema);
