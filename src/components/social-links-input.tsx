'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SOCIAL_PLATFORMS, getSocialPlatform, type TSocialLink } from '@/components/social-platforms';

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
						<div key={index} className="flex flex-col gap-2 rounded-md border p-3 sm:border-0 sm:p-0 sm:grid sm:grid-cols-[160px_1fr_auto] sm:items-center">
							<div className="flex items-center justify-between gap-2 sm:contents">
								<Select value={link.platform} onValueChange={(platformValue) => updateLink(index, { platform: platformValue })}>
									<SelectTrigger className="h-9 w-full sm:w-auto">
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
								<button
									type="button"
									onClick={() => removeLink(index)}
									className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors sm:hidden"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
							<Input
								value={link.url}
								onChange={(e) => updateLink(index, { url: e.target.value })}
								placeholder={platform.placeholder}
							/>
							<button
								type="button"
								onClick={() => removeLink(index)}
								className="hidden p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors sm:block"
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
