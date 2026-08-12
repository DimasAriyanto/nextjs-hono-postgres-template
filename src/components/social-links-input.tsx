'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Icon, type IconName } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface SocialLinksInputProps {
	value: TSocialLink[];
	onChange: (value: TSocialLink[]) => void;
	className?: string;
}

export function SocialLinksInput({ value, onChange, className }: SocialLinksInputProps) {
	const addLink = () => {
		const usedPlatforms = new Set(value.map((v) => v.platform));
		const nextPlatform = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.has(p.value)) ?? SOCIAL_PLATFORMS[0];
		onChange([...value, { platform: nextPlatform.value, url: '' }]);
	};

	const removeLink = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const updateLink = (index: number, patch: Partial<TSocialLink>) => {
		onChange(value.map((link, i) => (i === index ? { ...link, ...patch } : link)));
	};

	return (
		<div className={className}>
			<div className="space-y-2">
				{value.map((link, index) => {
					const platform = getSocialPlatform(link.platform);
					return (
						<div key={index} className="grid grid-cols-[160px_1fr_auto] gap-2 items-center">
							<Select value={link.platform} onValueChange={(platformValue) => updateLink(index, { platform: platformValue })}>
								<SelectTrigger className="h-9">
									<SelectValue placeholder="Select Platform" />
								</SelectTrigger>
								<SelectContent>
									{SOCIAL_PLATFORMS.map((p) => (
										<SelectItem key={p.value} value={p.value}>
											<span className="flex items-center gap-2">
												<Icon name={p.icon} className="w-3.5 h-3.5" />
												{p.label}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input
								value={link.url}
								onChange={(e) => updateLink(index, { url: e.target.value })}
								placeholder={platform.placeholder}
							/>
							<button
								type="button"
								onClick={() => removeLink(index)}
								className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
							>
								<Trash2 className="w-4 h-4" />
							</button>
						</div>
					);
				})}
			</div>
			<Button type="button" variant="ghost" size="sm" onClick={addLink} className="mt-2 text-primary">
				<Plus className="w-3.5 h-3.5" /> Add Social Media
			</Button>
		</div>
	);
}
