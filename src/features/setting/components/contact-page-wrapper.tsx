import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { getSettings } from '@/features/setting/apis/setting.api';
import { Icon } from '@/components/icon';
import { getSocialPlatform } from '@/components/social-platforms';
import type { TWeekday } from '@/contracts';

const DAY_LABELS: Record<TWeekday, string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday',
};

/** Only Google Maps' dedicated embed URL format is allowed to be framed — regular share/place links refuse to render inside an <iframe>. */
function isEmbeddableMapsUrl(url: string): boolean {
	return url.includes('/maps/embed') || url.includes('output=embed');
}

export async function ContactPageWrapper() {
	const { data: settings } = await getSettings();

	const hasContactInfo =
		settings.contact_email || settings.contact_phone || settings.address || settings.business_hours.length > 0 || settings.maps_url;

	return (
		<article className="container mx-auto max-w-3xl px-4 md:px-6 py-16">
			<h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
			<p className="mt-4 text-muted-foreground">
				Have a question or need help? Here&apos;s how you can reach {settings.app_name}.
			</p>

			{hasContactInfo ? (
				<div className="mt-10 space-y-6">
					{settings.contact_email && (
						<div className="flex items-start gap-4">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
								<Mail className="size-4.5" />
							</span>
							<div>
								<p className="text-sm text-muted-foreground">Email</p>
								<a href={`mailto:${settings.contact_email}`} className="font-medium hover:text-primary hover:underline">
									{settings.contact_email}
								</a>
							</div>
						</div>
					)}

					{settings.contact_phone && (
						<div className="flex items-start gap-4">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
								<Phone className="size-4.5" />
							</span>
							<div>
								<p className="text-sm text-muted-foreground">Phone</p>
								<a href={`tel:${settings.contact_phone}`} className="font-medium hover:text-primary hover:underline">
									{settings.contact_phone}
								</a>
							</div>
						</div>
					)}

					{settings.address && (
						<div className="flex items-start gap-4">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
								<MapPin className="size-4.5" />
							</span>
							<div>
								<p className="text-sm text-muted-foreground">Address</p>
								<p className="font-medium">{settings.address}</p>
							</div>
						</div>
					)}

					{settings.maps_url && (
						isEmbeddableMapsUrl(settings.maps_url) ? (
							<div className="overflow-hidden rounded-lg border border-border">
								<iframe
									src={settings.maps_url}
									className="h-72 w-full sm:h-96"
									style={{ border: 0 }}
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									title="Location map"
								/>
							</div>
						) : (
							<a
								href={settings.maps_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 rounded-lg border border-border p-4 text-sm font-medium transition-colors hover:bg-muted"
							>
								<MapPin className="size-4.5 shrink-0 text-muted-foreground" />
								View location on Google Maps
								<ExternalLink className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
							</a>
						)
					)}

					{settings.business_hours.length > 0 && (
						<div className="flex items-start gap-4">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
								<Clock className="size-4.5" />
							</span>
							<div>
								<p className="text-sm text-muted-foreground">Business Hours</p>
								<dl className="mt-1 space-y-1">
									{settings.business_hours.map((row) => (
										<div key={row.day} className="flex items-center gap-3 text-sm">
											<dt className="w-28 font-medium">{DAY_LABELS[row.day]}</dt>
											<dd className="text-muted-foreground">
												{row.is_closed ? 'Closed' : `${row.open_time} – ${row.close_time}`}
											</dd>
										</div>
									))}
								</dl>
							</div>
						</div>
					)}
				</div>
			) : (
				<p className="mt-10 text-muted-foreground">Contact information has not been added yet.</p>
			)}

			{settings.social_links.length > 0 && (
				<div className="mt-10 border-t border-border pt-8">
					<p className="mb-4 text-sm text-muted-foreground">Follow us</p>
					<div className="flex flex-wrap gap-3">
						{settings.social_links.map((link, index) => {
							const platform = getSocialPlatform(link.platform);
							return (
								<a
									key={index}
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
								>
									<Icon name={platform.icon} className="size-4" />
									{platform.label}
								</a>
							);
						})}
					</div>
				</div>
			)}
		</article>
	);
}
