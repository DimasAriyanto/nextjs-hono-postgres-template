import { permissionRepository } from '@/server/repositories';

export class PermissionService {
	/**
	 * Get all permissions
	 */
	async getAllPermissions() {
		return permissionRepository.findAll();
	}
}

export const permissionService = new PermissionService();
