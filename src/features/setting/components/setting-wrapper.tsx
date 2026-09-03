'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Contact, GalleryHorizontal, Globe2, HelpCircle, Info, Loader2, Palette, Scale, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { PageHeader } from '@/components/page-header';
import { useSettings, useUpdateSettings } from '@/features/setting/hooks/use-setting';
import { useUploadImage, useUploadVideo } from '@/features/upload/hooks/use-upload';
import { toastUploadError } from '@/libs/toast';
import { setAppCurrency, setAppLocale, setAppTimezone } from '@/libs/dayjs';
import { CONTENT_LOCALES, DEFAULT_CONTENT_LOCALE, updateSettingSchema, type TBannerItem, type TContentLocale, type TUpdateSettingRequest } from '@/contracts';
import type { PendingBannerFile } from '@/components/banner-input';
import { AboutTab } from './tabs/about-tab';
import { AppearanceTab } from './tabs/appearance-tab';
import { BannerTab } from './tabs/banner-tab';
import { ContactTab } from './tabs/contact-tab';
import { FaqTab } from './tabs/faq-tab';
import { GeneralTab } from './tabs/general-tab';
import { LegalTab } from './tabs/legal-tab';
import { RegionalTab } from './tabs/regional-tab';
import { SeoTab } from './tabs/seo-tab';

const EMPTY_BANNER_PENDING_FILES: Record<TContentLocale, Record<number, PendingBannerFile>> = { id: {}, en: {} };

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingWrapper() {
	const { data: settingsRes, isLoading } = useSettings();
	const settings = settingsRes?.data;

	const [logoFiles, setLogoFiles] = useState<File[]>([]);
	const [replacingLogo, setReplacingLogo] = useState(false);
	const [ogImageFiles, setOgImageFiles] = useState<File[]>([]);
	const [replacingOgImage, setReplacingOgImage] = useState(false);
	const [contentLocale, setContentLocale] = useState<TContentLocale>(DEFAULT_CONTENT_LOCALE);
	const [bannerPendingFiles, setBannerPendingFiles] = useState(EMPTY_BANNER_PENDING_FILES);

	const updateMutation = useUpdateSettings();
	const uploadImageMutation = useUploadImage();
	const uploadVideoMutation = useUploadVideo();

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
			whatsapp_enabled: true,
			translations: {
				about_content: { id: '', en: '' },
				terms_of_service: { id: '', en: '' },
				privacy_policy: { id: '', en: '' },
				faqs: { id: [], en: [] },
				banners: { id: [], en: [] },
				whatsapp_welcome_message: { id: '', en: '' },
				whatsapp_greetings: { id: [], en: [] },
				whatsapp_quick_replies: { id: [], en: [] },
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
				whatsapp_enabled: settings.whatsapp_enabled ?? true,
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

	// Banner media is picked but left un-uploaded until Save (unlike logo/OG image, an empty
	// banner's image_url fails schema validation, so pending files must be resolved to real
	// URLs *before* react-hook-form's zodResolver runs — otherwise handleSubmit's validation
	// gate rejects the row and `onSubmit` above never runs).
	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const hasPendingBanners = CONTENT_LOCALES.some((locale) => Object.keys(bannerPendingFiles[locale]).length > 0);

		if (hasPendingBanners) {
			const currentBanners = form.getValues('translations.banners');
			const nextBanners: Record<TContentLocale, TBannerItem[]> = {
				id: currentBanners?.id ?? [],
				en: currentBanners?.en ?? [],
			};

			for (const locale of CONTENT_LOCALES) {
				const pendingEntries = Object.entries(bannerPendingFiles[locale]);
				if (pendingEntries.length === 0) continue;

				const list = [...(nextBanners[locale] ?? [])];
				for (const [idxStr, pending] of pendingEntries) {
					const idx = Number(idxStr);
					const mutation = pending.mediaType === 'video' ? uploadVideoMutation : uploadImageMutation;
					try {
						const res = await mutation.mutateAsync({ file: pending.file, folder: 'banners' });
						list[idx] = { ...list[idx], image_url: res.data.url, media_type: pending.mediaType };
					} catch (err) {
						toastUploadError(err, 'banner media');
						return;
					}
				}
				nextBanners[locale] = list;
			}

			form.setValue('translations.banners', nextBanners, { shouldDirty: true });
			setBannerPendingFiles(EMPTY_BANNER_PENDING_FILES);
		}

		await form.handleSubmit(onSubmit)(e);
	};

	const isSaving = updateMutation.isPending || uploadImageMutation.isPending || uploadVideoMutation.isPending;

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
				<form onSubmit={handleFormSubmit} className="space-y-4">
					<Tabs defaultValue="general">
						<div className="overflow-x-auto pb-1 -mb-1">
							<TabsList className="w-max min-w-full justify-start">
								<TabsTrigger value="general" className="gap-1.5">
									<Building2 className="size-3.5 shrink-0" />
									<span>General</span>
								</TabsTrigger>
								<TabsTrigger value="about" className="gap-1.5">
									<Info className="size-3.5 shrink-0" />
									<span>About</span>
								</TabsTrigger>
								<TabsTrigger value="contact" className="gap-1.5">
									<Contact className="size-3.5 shrink-0" />
									<span>Contact</span>
								</TabsTrigger>
								<TabsTrigger value="regional" className="gap-1.5">
									<Globe2 className="size-3.5 shrink-0" />
									<span>Regional</span>
								</TabsTrigger>
								<TabsTrigger value="appearance" className="gap-1.5">
									<Palette className="size-3.5 shrink-0" />
									<span>Appearance</span>
								</TabsTrigger>
								<TabsTrigger value="banner" className="gap-1.5">
									<GalleryHorizontal className="size-3.5 shrink-0" />
									<span>Banner</span>
								</TabsTrigger>
								<TabsTrigger value="faq" className="gap-1.5">
									<HelpCircle className="size-3.5 shrink-0" />
									<span>FAQ</span>
								</TabsTrigger>
								<TabsTrigger value="legal" className="gap-1.5">
									<Scale className="size-3.5 shrink-0" />
									<span>Legal</span>
								</TabsTrigger>
								<TabsTrigger value="seo" className="gap-1.5">
									<Search className="size-3.5 shrink-0" />
									<span>SEO</span>
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="general">
							<GeneralTab
								form={form}
								isSaving={isSaving}
								settings={settings}
								logoFiles={logoFiles}
								onLogoFilesChange={setLogoFiles}
								replacingLogo={replacingLogo}
								onReplacingLogoChange={setReplacingLogo}
							/>
						</TabsContent>

						<TabsContent value="about">
							<AboutTab form={form} contentLocale={contentLocale} onContentLocaleChange={setContentLocale} />
						</TabsContent>

						<TabsContent value="contact">
							<ContactTab form={form} isSaving={isSaving} contentLocale={contentLocale} onContentLocaleChange={setContentLocale} />
						</TabsContent>

						<TabsContent value="regional">
							<RegionalTab form={form} isSaving={isSaving} />
						</TabsContent>

						<TabsContent value="appearance">
							<AppearanceTab form={form} isSaving={isSaving} />
						</TabsContent>

						<TabsContent value="banner">
							<BannerTab
								form={form}
								isSaving={isSaving}
								contentLocale={contentLocale}
								onContentLocaleChange={setContentLocale}
								pendingFiles={bannerPendingFiles[contentLocale]}
								onPendingFilesChange={(files) => setBannerPendingFiles((prev) => ({ ...prev, [contentLocale]: files }))}
							/>
						</TabsContent>

						<TabsContent value="faq">
							<FaqTab form={form} contentLocale={contentLocale} onContentLocaleChange={setContentLocale} />
						</TabsContent>

						<TabsContent value="legal">
							<LegalTab form={form} contentLocale={contentLocale} onContentLocaleChange={setContentLocale} />
						</TabsContent>

						<TabsContent value="seo">
							<SeoTab
								form={form}
								isSaving={isSaving}
								settings={settings}
								ogImageFiles={ogImageFiles}
								onOgImageFilesChange={setOgImageFiles}
								replacingOgImage={replacingOgImage}
								onReplacingOgImageChange={setReplacingOgImage}
							/>
						</TabsContent>
					</Tabs>

					<div className="flex justify-end">
						<Button type="submit" size="sm" disabled={isSaving}>
							{isSaving
								? <><Loader2 className="size-4 mr-1.5 animate-spin" />{uploadImageMutation.isPending || uploadVideoMutation.isPending ? 'Uploading...' : 'Saving...'}</>
								: 'Save Changes'
							}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
