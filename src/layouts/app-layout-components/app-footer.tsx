import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Icon } from '@/components/icon';
import { getSocialPlatform } from '@/components/social-links-input';
import type { TSetting } from '@/contracts';

interface AppFooterProps {
	settings?: TSetting;
}

export const AppFooter = ({ settings }: AppFooterProps) => {
	const appName = settings?.app_name ?? 'App';
	const year = new Date().getFullYear();
	const socialLinks = settings?.social_links ?? [];

	return (
		<footer className="border-t border-border bg-background">
			<div className="container mx-auto px-4 md:px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{/* General */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						{settings?.logo_url && (
							<Image src={settings.logo_url} alt={appName} width={28} height={28} className="rounded object-contain" />
						)}
						<span className="font-bold text-lg tracking-tight">{appName}</span>
					</div>
					{settings?.description && (
						<p className="text-sm text-muted-foreground max-w-sm">{settings.description}</p>
					)}
				</div>

				{/* Contact */}
				<div className="space-y-3">
					<h3 className="text-sm font-semibold">Contact</h3>
					<ul className="space-y-2 text-sm text-muted-foreground">
						{settings?.contact_email && (
							<li className="flex items-center gap-2">
								<Mail className="size-4 shrink-0" />
								<a href={`mailto:${settings.contact_email}`} className="hover:text-foreground transition-colors">
									{settings.contact_email}
								</a>
							</li>
						)}
						{settings?.contact_phone && (
							<li className="flex items-center gap-2">
								<Phone className="size-4 shrink-0" />
								<a href={`tel:${settings.contact_phone}`} className="hover:text-foreground transition-colors">
									{settings.contact_phone}
								</a>
							</li>
						)}
						{settings?.address && (
							<li className="flex items-start gap-2">
								<MapPin className="size-4 shrink-0 mt-0.5" />
								<span>{settings.address}</span>
							</li>
						)}
					</ul>
				</div>

				{/* Social */}
				{socialLinks.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-sm font-semibold">Social Media</h3>
						<div className="flex flex-wrap gap-2">
							{socialLinks.map((link) => {
								const platform = getSocialPlatform(link.platform);
								return (
									<a
										key={link.platform}
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										title={platform.label}
										className="flex items-center justify-center size-9 rounded-full border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
									>
										<Icon name={platform.icon} className="size-4" />
									</a>
								);
							})}
						</div>
					</div>
				)}
			</div>

			<div className="border-t border-border py-4">
				<p className="text-center text-xs text-muted-foreground">
					© {year} {appName}. All rights reserved.
				</p>
			</div>
		</footer>
	);
};
