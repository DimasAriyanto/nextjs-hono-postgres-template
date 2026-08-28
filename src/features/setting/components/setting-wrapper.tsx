'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Contact, GalleryHorizontal, Globe2, HelpCircle, Info, Languages, Loader2, Palette, Scale, Search, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SocialLinksInput } from '@/components/social-links-input';
import { BusinessHoursInput } from '@/components/business-hours-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { FaqInput } from '@/components/faq-input';
import { BannerInput } from '@/components/banner-input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { PageHeader } from '@/components/page-header';
import { useSettings, useUpdateSettings } from '@/features/setting/hooks/use-setting';
import { useUploadImage } from '@/features/upload/hooks/use-upload';
import { useConvertCurrency } from '@/features/currency/hooks/use-currency';
import { toastUploadError } from '@/libs/toast';
import { LOCALE_OPTIONS, setAppCurrency, setAppLocale, setAppTimezone } from '@/libs/dayjs';
import { BANNER_DISPLAY_MODES, CONTENT_LOCALES, DEFAULT_CONTENT_LOCALE, updateSettingSchema, type TBannerDisplayMode, type TContentLocale, type TUpdateSettingRequest } from '@/contracts';

// ─── Timezone options ───────────────────────────────────────────────────────────

const TIMEZONE_OPTIONS = [
	{ value: 'UTC', label: 'UTC' },
	{ value: 'Asia/Jakarta', label: 'WIB — Asia/Jakarta' },
	{ value: 'Asia/Makassar', label: 'WITA — Asia/Makassar' },
	{ value: 'Asia/Jayapura', label: 'WIT — Asia/Jayapura' },
	{ value: 'Asia/Singapore', label: 'Asia/Singapore' },
	{ value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala Lumpur' },
	{ value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
	{ value: 'Asia/Manila', label: 'Asia/Manila' },
	{ value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
	{ value: 'Asia/Seoul', label: 'Asia/Seoul' },
	{ value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
	{ value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong' },
	{ value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
	{ value: 'Asia/Dubai', label: 'Asia/Dubai' },
	{ value: 'Australia/Sydney', label: 'Australia/Sydney' },
	{ value: 'Europe/London', label: 'Europe/London' },
	{ value: 'Europe/Paris', label: 'Europe/Paris' },
	{ value: 'America/New_York', label: 'America/New York' },
	{ value: 'America/Chicago', label: 'America/Chicago' },
	{ value: 'America/Los_Angeles', label: 'America/Los Angeles' },
];

// ─── Currency options ───────────────────────────────────────────────────────────
const CURRENCY_OPTIONS = [
	{ value: 'IDR', label: 'IDR — Indonesian Rupiah' },
	{ value: 'USD', label: 'USD — US Dollar' },
];

// ─── Appearance ─────────────────────────────────────────────────────────────────

const DEFAULT_PRIMARY_COLOR = '#171717';

// ─── Content locale (About / FAQ / Banner / Legal tabs) ─────────────────────────

const CONTENT_LOCALE_LABELS: Record<TContentLocale, string> = {
	id: 'Indonesian',
	en: 'English',
};

const BANNER_DISPLAY_MODE_LABELS: Record<TBannerDisplayMode, string> = {
	carousel: 'Carousel',
	hero: 'Hero',
};

function CurrencyRatePreview({ currency }: { currency: string | undefined }) {
	const reference = currency === 'USD' ? 'IDR' : 'USD';
	const { data, isLoading, isError } = useConvertCurrency({ from: currency ?? '', to: reference, amount: 1 });

	if (!currency) return null;

	return (
		<p className="text-sm text-muted-foreground">
			{isLoading && 'Fetching live exchange rate…'}
			{isError && 'Live rate unavailable — set OPEN_EXCHANGE_RATES_APP_ID in .env to enable this preview.'}
			{data && `1 ${currency} ≈ ${data.data.converted.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${reference} (live rate)`}
		</p>
	);
}

function ContentLocaleSwitcher({ value, onChange }: { value: TContentLocale; onChange: (locale: TContentLocale) => void }) {
	return (
		<div className="flex items-center gap-2 mb-4">
			<Languages className="size-4 text-muted-foreground" />
			<span className="text-sm text-muted-foreground">Editing:</span>
			<div className="inline-flex rounded-md border border-input p-0.5">
				{CONTENT_LOCALES.map((locale) => (
					<Button
						key={locale}
						type="button"
						size="sm"
						variant={value === locale ? 'default' : 'ghost'}
						className="h-7 px-3"
						onClick={() => onChange(locale)}
					>
						{CONTENT_LOCALE_LABELS[locale]}
					</Button>
				))}
			</div>
		</div>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingWrapper() {
	const { data: settingsRes, isLoading } = useSettings();
	const settings = settingsRes?.data;

	const [logoFiles, setLogoFiles] = useState<File[]>([]);
	const [replacingLogo, setReplacingLogo] = useState(false);
	const [ogImageFiles, setOgImageFiles] = useState<File[]>([]);
	const [replacingOgImage, setReplacingOgImage] = useState(false);
	const [contentLocale, setContentLocale] = useState<TContentLocale>(DEFAULT_CONTENT_LOCALE);

	const updateMutation = useUpdateSettings();
	const uploadImageMutation = useUploadImage();

	const form = useForm<TUpdateSettingRequest>({
		resolver: zodResolver(updateSettingSchema),
		defaultValues: {
			app_name: '',
			description: '',
			logo_url: '',
			contact_email: '',
			contact_phone: '',
			address: '',
			social_links: [],
			maps_url: '',
			business_hours: [],
			timezone: '',
			locale: '',
			currency: '',
			primary_color: '',
			banner_display_mode: 'carousel',
			default_content_locale: DEFAULT_CONTENT_LOCALE,
			language_switcher_enabled: true,
			ga_id: '',
			gtm_id: '',
			google_site_verification: '',
			og_image_url: '',
			translations: {
				about_content: { id: '', en: '' },
				terms_of_service: { id: '', en: '' },
				privacy_policy: { id: '', en: '' },
				faqs: { id: [], en: [] },
				banners: { id: [], en: [] },
			},
		},
		values: settings
			? {
				app_name: settings.app_name,
				description: settings.description ?? '',
				logo_url: settings.logo_url ?? '',
				contact_email: settings.contact_email ?? '',
				contact_phone: settings.contact_phone ?? '',
				address: settings.address ?? '',
				social_links: settings.social_links,
				maps_url: settings.maps_url ?? '',
				business_hours: settings.business_hours,
				timezone: settings.timezone,
				locale: settings.locale,
				currency: settings.currency,
				primary_color: settings.primary_color ?? '',
				banner_display_mode: settings.banner_display_mode,
				default_content_locale: settings.default_content_locale,
				language_switcher_enabled: settings.language_switcher_enabled,
				ga_id: settings.ga_id ?? '',
				gtm_id: settings.gtm_id ?? '',
				google_site_verification: settings.google_site_verification ?? '',
				og_image_url: settings.og_image_url ?? '',
				translations: settings.translations,
			}
			: undefined,
	});

	// Reflect the app's configured regional preferences as soon as settings load
	useEffect(() => {
		if (settings?.timezone) setAppTimezone(settings.timezone);
		if (settings?.locale) setAppLocale(settings.locale);
		if (settings?.currency) setAppCurrency(settings.currency);
	}, [settings?.timezone, settings?.locale, settings?.currency]);

	const onSubmit = async (values: TUpdateSettingRequest) => {
		let logoUrl = values.logo_url;
		let ogImageUrl = values.og_image_url;

		if (logoFiles[0]) {
			try {
				const res = await uploadImageMutation.mutateAsync({ file: logoFiles[0], folder: 'settings' });
				logoUrl = res.data.url;
			} catch (err) {
				toastUploadError(err, 'logo');
				return;
			}
		}

		if (ogImageFiles[0]) {
			try {
				const res = await uploadImageMutation.mutateAsync({ file: ogImageFiles[0], folder: 'settings' });
				ogImageUrl = res.data.url;
			} catch (err) {
				toastUploadError(err, 'OG image');
				return;
			}
		}

		updateMutation.mutate(
			{ ...values, logo_url: logoUrl, og_image_url: ogImageUrl },
			{
				onSuccess: () => {
					setLogoFiles([]);
					setReplacingLogo(false);
					setOgImageFiles([]);
					setReplacingOgImage(false);
					toast.success('Settings updated', { description: 'Your settings have been updated successfully.' });
				},
				onError: (err) => toast.error('Failed to update settings', { description: err.message }),
			},
		);
	};

	const isSaving = updateMutation.isPending || uploadImageMutation.isPending;

	if (isLoading) {
		return (
			<>
				<PageHeader
					breadcrumbs={[{ label: 'Dashboard', href: '/gundala-admin/d' }, { label: 'Settings' }]}
					title="Settings"
				/>
				<div className="space-y-4">
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-64 w-full" />
				</div>
			</>
		);
	}

	return (
		<>
			<PageHeader
				breadcrumbs={[{ label: 'Dashboard', href: '/gundala-admin/d' }, { label: 'Settings' }]}
				title="Settings"
				description="Manage general application information, contact details and regional preferences."
			/>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<Tabs defaultValue="general">
						<TabsList>
							<TabsTrigger value="general"><Building2 className="size-3.5 mr-1.5" />General</TabsTrigger>
							<TabsTrigger value="about"><Info className="size-3.5 mr-1.5" />About</TabsTrigger>
							<TabsTrigger value="contact"><Contact className="size-3.5 mr-1.5" />Contact</TabsTrigger>
							<TabsTrigger value="regional"><Globe2 className="size-3.5 mr-1.5" />Regional</TabsTrigger>
							<TabsTrigger value="appearance"><Palette className="size-3.5 mr-1.5" />Appearance</TabsTrigger>
							<TabsTrigger value="banner"><GalleryHorizontal className="size-3.5 mr-1.5" />Banner</TabsTrigger>
							<TabsTrigger value="faq"><HelpCircle className="size-3.5 mr-1.5" />FAQ</TabsTrigger>
							<TabsTrigger value="legal"><Scale className="size-3.5 mr-1.5" />Legal</TabsTrigger>
							<TabsTrigger value="seo"><Search className="size-3.5 mr-1.5" />SEO</TabsTrigger>
						</TabsList>

						{/* ── General ── */}
						<TabsContent value="general">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<div className="grid gap-2">
										<FormLabel>Logo</FormLabel>
										{settings?.logo_url && !replacingLogo && logoFiles.length === 0 ? (
											<div className="relative h-24 w-24">
												<div className="h-24 w-24 overflow-hidden rounded-md ring-1 ring-border bg-muted relative">
													<Image src={settings.logo_url} alt="Logo" fill className="object-contain" />
												</div>
												<button
													type="button"
													onClick={() => setReplacingLogo(true)}
													disabled={isSaving}
													className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
												>
													<X className="size-3.5" />
												</button>
											</div>
										) : (
											<FileUpload
												compact
												compactShape="square"
												compactSize={96}
												accept="image/*"
												maxSize={5 * 1024 * 1024}
												value={logoFiles}
												onChange={setLogoFiles}
												disabled={isSaving}
											/>
										)}
									</div>

									<FormField control={form.control} name="app_name" render={({ field }) => (
										<FormItem>
											<FormLabel>App Name</FormLabel>
											<FormControl><Input {...field} placeholder="My App" disabled={isSaving} /></FormControl>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="description" render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													disabled={isSaving}
													rows={3}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── About ── */}
						<TabsContent value="about">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<ContentLocaleSwitcher value={contentLocale} onChange={setContentLocale} />
									<FormField control={form.control} name={`translations.about_content.${contentLocale}`} render={({ field }) => (
										<FormItem>
											<FormLabel>About Us</FormLabel>
											<RichTextEditor key={contentLocale} content={field.value ?? ''} onChange={field.onChange} placeholder="Tell visitors about your company..." />
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── Contact ── */}
						<TabsContent value="contact">
							<Card>
								<CardContent className="pt-6 space-y-6">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<FormField control={form.control} name="contact_email" render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl><Input {...field} type="email" placeholder="hello@example.com" disabled={isSaving} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />

										<FormField control={form.control} name="contact_phone" render={({ field }) => (
											<FormItem>
												<FormLabel>Phone Number</FormLabel>
												<FormControl><PhoneInput value={field.value} onChange={field.onChange} disabled={isSaving} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />
									</div>

									<FormField control={form.control} name="address" render={({ field }) => (
										<FormItem>
											<FormLabel>Address</FormLabel>
											<FormControl><Textarea {...field} placeholder="Company address" disabled={isSaving} rows={2} /></FormControl>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="maps_url" render={({ field }) => (
										<FormItem>
											<FormLabel>Maps Embed URL</FormLabel>
											<FormControl>
												<Input {...field} placeholder="https://www.google.com/maps/embed?pb=..." disabled={isSaving} />
											</FormControl>
											<p className="text-sm text-muted-foreground">
												From Google Maps: Share → Embed a map → copy the src URL.
											</p>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="social_links" render={({ field }) => (
										<FormItem>
											<FormLabel>Social Media</FormLabel>
											<SocialLinksInput value={field.value ?? []} onChange={field.onChange} />
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="business_hours" render={({ field }) => (
										<FormItem>
											<FormLabel>Business Hours</FormLabel>
											<BusinessHoursInput value={field.value ?? []} onChange={field.onChange} disabled={isSaving} />
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── Regional ── */}
						<TabsContent value="regional">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<FormField control={form.control} name="timezone" render={({ field }) => (
										<FormItem>
											<FormLabel>Timezone</FormLabel>
											<Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
												<FormControl>
													<SelectTrigger className="w-full sm:w-80">
														<SelectValue placeholder="Select timezone" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{TIMEZONE_OPTIONS.map((tz) => (
														<SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="locale" render={({ field }) => (
										<FormItem>
											<FormLabel>Regional Format</FormLabel>
											<Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
												<FormControl>
													<SelectTrigger className="w-full sm:w-80">
														<SelectValue placeholder="Select regional format" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{LOCALE_OPTIONS.map((locale) => (
														<SelectItem key={locale.value} value={locale.value}>{locale.label}</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="currency" render={({ field }) => (
										<FormItem>
											<FormLabel>Currency</FormLabel>
											<Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
												<FormControl>
													<SelectTrigger className="w-full sm:w-80">
														<SelectValue placeholder="Select currency" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{CURRENCY_OPTIONS.map((currency) => (
														<SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>
													))}
												</SelectContent>
											</Select>
											<CurrencyRatePreview currency={field.value} />
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="default_content_locale" render={({ field }) => (
										<FormItem>
											<FormLabel>Default Language</FormLabel>
											<Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
												<FormControl>
													<SelectTrigger className="w-full sm:w-80">
														<SelectValue placeholder="Select default language" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{CONTENT_LOCALES.map((locale) => (
														<SelectItem key={locale} value={locale}>{CONTENT_LOCALE_LABELS[locale]}</SelectItem>
													))}
												</SelectContent>
											</Select>
											<p className="text-sm text-muted-foreground">
												Language shown to first-time visitors, and used whenever a page has no translation for their chosen language yet.
											</p>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="language_switcher_enabled" render={({ field }) => (
										<FormItem>
											<div className="flex items-center justify-between rounded-md border border-input p-3 sm:w-80">
												<div className="space-y-0.5">
													<FormLabel>Language Switcher</FormLabel>
													<p className="text-sm text-muted-foreground">Let visitors change the site language.</p>
												</div>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSaving} />
												</FormControl>
											</div>
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── Appearance ── */}
						<TabsContent value="appearance">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<FormField control={form.control} name="primary_color" render={({ field }) => (
										<FormItem>
											<FormLabel>Primary Color</FormLabel>
											<div className="flex items-center gap-2">
												<FormControl>
													<input
														type="color"
														value={field.value || DEFAULT_PRIMARY_COLOR}
														onChange={(e) => field.onChange(e.target.value)}
														disabled={isSaving}
														className="h-9 w-12 cursor-pointer rounded-md border border-input p-1"
													/>
												</FormControl>
												<Input
													value={field.value ?? ''}
													onChange={(e) => field.onChange(e.target.value)}
													placeholder={DEFAULT_PRIMARY_COLOR}
													disabled={isSaving}
													className="w-32 font-mono uppercase"
													maxLength={7}
												/>
												<Button type="button" variant="ghost" size="sm" onClick={() => field.onChange('')} disabled={isSaving}>
													Reset to default
												</Button>
											</div>
											<p className="text-sm text-muted-foreground">Accent color used across buttons, links and highlights throughout the app.</p>
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── Banner ── */}
						<TabsContent value="banner">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<FormField control={form.control} name="banner_display_mode" render={({ field }) => (
										<FormItem>
											<FormLabel>Display Mode</FormLabel>
											<Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
												<FormControl>
													<SelectTrigger className="w-full sm:w-80">
														<SelectValue placeholder="Select display mode" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{BANNER_DISPLAY_MODES.map((mode) => (
														<SelectItem key={mode} value={mode}>{BANNER_DISPLAY_MODE_LABELS[mode]}</SelectItem>
													))}
												</SelectContent>
											</Select>
											<p className="text-sm text-muted-foreground">
												Carousel rotates through all banners below. Hero shows only the first banner as a static section — set its Text Align to Left/Right for a split image-and-text layout, or Center for a full-width image with overlay text.
											</p>
											<FormMessage />
										</FormItem>
									)} />

									<ContentLocaleSwitcher value={contentLocale} onChange={setContentLocale} />
									<FormField control={form.control} name={`translations.banners.${contentLocale}`} render={({ field }) => (
										<FormItem>
											<FormLabel>Home Page Banners</FormLabel>
											<BannerInput value={field.value ?? []} onChange={field.onChange} disabled={isSaving} />
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── FAQ ── */}
						<TabsContent value="faq">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<ContentLocaleSwitcher value={contentLocale} onChange={setContentLocale} />
									<FormField control={form.control} name={`translations.faqs.${contentLocale}`} render={({ field }) => (
										<FormItem>
											<FormLabel>Frequently Asked Questions</FormLabel>
											<FaqInput value={field.value ?? []} onChange={field.onChange} />
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── Legal ── */}
						<TabsContent value="legal">
							<Card>
								<CardContent className="pt-6 space-y-6">
									<ContentLocaleSwitcher value={contentLocale} onChange={setContentLocale} />

									<FormField control={form.control} name={`translations.terms_of_service.${contentLocale}`} render={({ field }) => (
										<FormItem>
											<FormLabel>Terms of Service</FormLabel>
											<RichTextEditor key={contentLocale} content={field.value ?? ''} onChange={field.onChange} placeholder="Write your terms of service..." />
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name={`translations.privacy_policy.${contentLocale}`} render={({ field }) => (
										<FormItem>
											<FormLabel>Privacy Policy</FormLabel>
											<RichTextEditor key={contentLocale} content={field.value ?? ''} onChange={field.onChange} placeholder="Write your privacy policy..." />
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── SEO ── */}
						<TabsContent value="seo">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<div className="grid gap-2">
										<FormLabel>OG Image (Social Share Image)</FormLabel>
										{settings?.og_image_url && !replacingOgImage && ogImageFiles.length === 0 ? (
											<div className="relative h-40 w-full">
												<div className="h-40 w-full overflow-hidden rounded-md ring-1 ring-border bg-muted relative">
													<Image src={settings.og_image_url} alt="OG Image" fill className="object-cover" />
												</div>
												<button
													type="button"
													onClick={() => setReplacingOgImage(true)}
													disabled={isSaving}
													className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
												>
													<X className="size-3.5" />
												</button>
											</div>
										) : (
											<FileUpload
												compact
												compactShape="rect"
												compactSize={160}
												accept="image/*"
												maxSize={5 * 1024 * 1024}
												value={ogImageFiles}
												onChange={setOgImageFiles}
												disabled={isSaving}
												description="Click to upload · 1200×630 recommended"
											/>
										)}
										<p className="text-sm text-muted-foreground">
											Shown when a page is shared on WhatsApp, Facebook, X, etc. Recommended size 1200×630. Falls back to the Logo above if left empty.
										</p>
									</div>

									<FormField control={form.control} name="ga_id" render={({ field }) => (
										<FormItem>
											<FormLabel>Google Analytics Measurement ID</FormLabel>
											<FormControl><Input {...field} placeholder="G-XXXXXXXXXX" disabled={isSaving} /></FormControl>
											<p className="text-sm text-muted-foreground">
												From Google Analytics: Admin → Data Streams → your stream → Measurement ID.
											</p>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="gtm_id" render={({ field }) => (
										<FormItem>
											<FormLabel>Google Tag Manager Container ID</FormLabel>
											<FormControl><Input {...field} placeholder="GTM-XXXXXXX" disabled={isSaving} /></FormControl>
											<p className="text-sm text-muted-foreground">
												From Google Tag Manager: top of the workspace, next to your container name.
											</p>
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="google_site_verification" render={({ field }) => (
										<FormItem>
											<FormLabel>Google Search Console Verification</FormLabel>
											<FormControl><Input {...field} placeholder="content value from the HTML tag verification method" disabled={isSaving} /></FormControl>
											<p className="text-sm text-muted-foreground">
												From Search Console: Settings → Ownership verification → HTML tag → copy just the <code>content</code> value.
											</p>
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>

					<div className="flex justify-end">
						<Button type="submit" size="sm" disabled={isSaving}>
							{isSaving
								? <><Loader2 className="size-4 mr-1.5 animate-spin" />{uploadImageMutation.isPending ? 'Uploading...' : 'Saving...'}</>
								: 'Save Changes'
							}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
