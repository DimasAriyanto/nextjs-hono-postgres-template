export const ROLES = ['platform_admin', 'owner'] as const;
export type TRole = (typeof ROLES)[number];

export function canAccess(role: TRole, pathname: string): boolean {
	// Onboarding accessible to all authenticated users
	if (pathname.startsWith('/onboarding')) return true;

	switch (role) {
		case 'platform_admin':
			return pathname.startsWith('/gundala-admin');
		case 'owner':
			return pathname.startsWith('/dashboard');
		default:
			return false;
	}
}

// Default redirect after login, per role
export const ROLE_DEFAULT_REDIRECT: Record<TRole, string> = {
	platform_admin: '/gundala-admin/d',
	owner: '/dashboard/d',
};

// Menu item titles hidden per role (used in the sidebar)
export const ROLE_HIDDEN_MENUS: Partial<Record<TRole, string[]>> = {
	platform_admin: [],
	owner: [],
};
