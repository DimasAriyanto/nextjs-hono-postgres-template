import { type IconName } from '@/components/icon';
import type { Config } from 'ziggy-js';

export interface TBreadcrumbItem {
	title: string;
	href: string;
}

export interface TNavGroup {
	title: string;
	items: TNavItem[];
}

export interface TNavItem {
	title: string;
	href: string;
	icon?: IconName | null;
	isActive?: boolean;
}

export interface TSharedData {
	name: string;
	quote: { message: string; author: string };
	auth: Auth;
	ziggy: Config & { location: string };
	sidebarOpen: boolean;
	[key: string]: unknown;
}
