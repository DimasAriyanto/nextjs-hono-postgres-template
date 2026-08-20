import type { IconName } from '@/components/icon';

export type TSocialLink = {
	platform: string;
	url: string;
};

export type TSocialPlatform = {
	value: string;
	label: string;
	icon: IconName;
	placeholder: string;
};

export const SOCIAL_PLATFORMS: TSocialPlatform[] = [
	{ value: 'facebook', label: 'Facebook', icon: 'ThumbsUp', placeholder: 'https://facebook.com/yourstore' },
	{ value: 'instagram', label: 'Instagram', icon: 'Camera', placeholder: 'https://instagram.com/yourstore' },
	{ value: 'threads', label: 'Threads', icon: 'AtSign', placeholder: 'https://threads.net/@yourstore' },
	{ value: 'tiktok', label: 'TikTok', icon: 'Music2', placeholder: 'https://tiktok.com/@yourstore' },
	{ value: 'youtube', label: 'YouTube', icon: 'PlayCircle', placeholder: 'https://youtube.com/@yourstore' },
	{ value: 'twitter', label: 'Twitter / X', icon: 'X', placeholder: 'https://x.com/yourstore' },
	{ value: 'linkedin', label: 'LinkedIn', icon: 'Briefcase', placeholder: 'https://linkedin.com/company/yourstore' },
	{ value: 'telegram', label: 'Telegram', icon: 'Send', placeholder: 'https://t.me/yourstore' },
	{ value: 'tokopedia', label: 'Tokopedia', icon: 'ShoppingBag', placeholder: 'https://tokopedia.com/yourstore' },
	{ value: 'shopee', label: 'Shopee', icon: 'ShoppingBag', placeholder: 'https://shopee.co.id/yourstore' },
	{ value: 'website', label: 'Other Website', icon: 'Globe', placeholder: 'https://yourstore.com' },
];

export function getSocialPlatform(value: string): TSocialPlatform {
	return SOCIAL_PLATFORMS.find((p) => p.value === value) ?? SOCIAL_PLATFORMS[0];
}
