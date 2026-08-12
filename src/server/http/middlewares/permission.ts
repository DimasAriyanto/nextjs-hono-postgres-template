import { createMiddleware } from 'hono/factory';
import { AuthError } from '@/server/errors';
import { permissionRepository } from '@/server/repositories';
import type { TMenuPermissionKey } from '@/constants/permissions';

export const checkPermission = (key: TMenuPermissionKey) =>
	createMiddleware(async (c, next) => {
		const payload = c.get('user') as { auid: string; aurl: string | null };

		if (payload.aurl === 'admin') {
			await next();
			return;
		}

		const allowed = await permissionRepository.userHasPermission(payload.auid, key);
		if (!allowed) {
			throw AuthError.forbidden();
		}

		await next();
	});
