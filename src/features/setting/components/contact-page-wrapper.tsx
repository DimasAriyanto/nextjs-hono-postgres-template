import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/features/setting/apis/setting.api';
import { getAppUrl, toJsonLdScript } from '@/libs/seo';
import { Icon } from '@/components/icon';
import { getSocialPlatform } from '@/components/social-platforms';
import type { TSetting } from '@/contracts';

/** Only Google Maps' dedicated embed URL format is allowed to be framed — regular share/place links refuse to render inside an <iframe>. */
function isEmbeddableMapsUrl(url: string): boolean {
	return url.includes('/maps/embed') || url.includes('output=embed');
}

/**
 * `LocalBusiness` JSON-LD so this page can surface in local/"near me" search and Google Maps.
 * Only emitted when an address is configured — that's the minimum Google expects for the type.
 */
function buildLocalBusinessJsonLd(settings: TSetting, appUrl: string) {
	const openingHours = settings.business_hours
		.filter((row) => !row.is_closed && row.open_time && row.close_time)
		.map((row) => ({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: `https://schema.org/${row.day.charAt(0).toUpperCase()}${row.day.slice(1)}`,
			opens: row.open_time,
			closes: row.close_time,
		}));

	return {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		name: settings.app_name,
		image: settings.logo_url ?? undefined,
		url: appUrl,
		address: { '@type': 'PostalAddress', streetAddress: settings.address ?? undefined },
		telephone: settings.contact_phone ?? undefined,
		email: settings.contact_email ?? undefined,
		sameAs: settings.social_links.length > 0 ? settings.social_links.map((link) => link.url) : undefined,
		openingHoursSpecification: openingHours.length > 0 ? openingHours : undefined,
	};
}

export async function ContactPageWrapper() {
	const [{ data: settings }, t] = await Promise.all([getSettings(), getTranslations('contact')]);

	const hasContactInfo =
		settings.contact_email || settings.contact_phone || settings.address || settings.business_hours.length > 0 || settings.maps_url;

	return (
		<article className="container mx-auto max-w-3xl px-4 md:px-6 py-16">
			{settings.address && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildLocalBusinessJsonLd(settings, getAppUrl())) }}
				/>
			)}

			<h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
			<p className="mt-4 text-muted-foreground">
				{t('haveQuestion', { appName: settings.app_name })}
			</p>

			{hasContactInfo ? (
				<div className="mt-10 space-y-6">
					{settings.contact_email && (
						<div className="flex items-start gap-4">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
								<Mail className="size-4.5" />
							</span>
							<div>
								<p className="text-sm text-muted-foreground">{t('email')}</p>
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
								<p className="text-sm text-muted-foreground">{t('phone')}</p>
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
								<p className="text-sm text-muted-foreground">{t('address')}</p>
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
								{t('viewOnMaps')}
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
								<p className="text-sm text-muted-foreground">{t('businessHours')}</p>
								<dl className="mt-1 space-y-1">
									{settings.business_hours.map((row) => (
										<div key={row.day} className="flex items-center gap-3 text-sm">
											<dt className="w-28 font-medium">{t(`days.${row.day}`)}</dt>
											<dd className="text-muted-foreground">
												{row.is_closed ? t('closed') : `${row.open_time} – ${row.close_time}`}
											</dd>
										</div>
									))}
								</dl>
							</div>
						</div>
					)}
				</div>
			) : (
				<p className="mt-10 text-muted-foreground">{t('noContactInfo')}</p>
			)}

			{settings.social_links.length > 0 && (
				<div className="mt-10 border-t border-border pt-8">
					<p className="mb-4 text-sm text-muted-foreground">{t('followUs')}</p>
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
