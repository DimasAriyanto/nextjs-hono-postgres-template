export const MENU_PERMISSIONS = [
	{ key: 'menu.dashboard.view', menu: 'Dashboard', action: 'view' },
	{ key: 'menu.user.view', menu: 'User', action: 'view' },
	{ key: 'menu.user.manage', menu: 'User', action: 'manage' },
	{ key: 'menu.role.view', menu: 'Role', action: 'view' },
	{ key: 'menu.role.manage', menu: 'Role', action: 'manage' },
	{ key: 'menu.article.view', menu: 'Article', action: 'view' },
	{ key: 'menu.article.manage', menu: 'Article', action: 'manage' },
	{ key: 'menu.gallery.view', menu: 'Gallery', action: 'view' },
	{ key: 'menu.gallery.manage', menu: 'Gallery', action: 'manage' },
	{ key: 'menu.settings.view', menu: 'Settings', action: 'view' },
	{ key: 'menu.settings.manage', menu: 'Settings', action: 'manage' },
] as const;

export type TMenuPermissionKey = (typeof MENU_PERMISSIONS)[number]['key'];
