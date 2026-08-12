'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Contact, Globe2, HelpCircle, ImagePlus, Loader2, Scale } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SocialLinksInput } from '@/components/social-links-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { FaqInput } from '@/components/faq-input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { PageHeader } from '@/components/page-header';
import { useSettings, useUpdateSettings } from '@/features/setting/hooks/use-setting';
import { LOCALE_OPTIONS, setAppCurrency, setAppLocale, setAppTimezone } from '@/libs/dayjs';
import { updateSettingSchema, type TUpdateSettingRequest } from '@/contracts';

// ─── Upload helper ─────────────────────────────────────────────────────────────

async function uploadLogo(file: File): Promise<string> {
	const fd = new FormData();
	fd.append('file', file);
	fd.append('folder', 'settings');
	const res = await fetch('/api/v1/uploads/image', { method: 'POST', body: fd });
	if (!res.ok) {
		const json = await res.json() as { message?: string };
		throw new Error(json.message ?? 'Failed to upload logo');
	}
	const json = await res.json() as { data: { url: string } };
	return json.data.url;
}

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
	{ value: 'EUR', label: 'EUR — Euro' },
	{ value: 'GBP', label: 'GBP — British Pound' },
	{ value: 'JPY', label: 'JPY — Japanese Yen' },
	{ value: 'SGD', label: 'SGD — Singapore Dollar' },
	{ value: 'MYR', label: 'MYR — Malaysian Ringgit' },
	{ value: 'AUD', label: 'AUD — Australian Dollar' },
	{ value: 'CNY', label: 'CNY — Chinese Yuan' },
	{ value: 'INR', label: 'INR — Indian Rupee' },
	{ value: 'KRW', label: 'KRW — South Korean Won' },
	{ value: 'THB', label: 'THB — Thai Baht' },
	{ value: 'PHP', label: 'PHP — Philippine Peso' },
	{ value: 'VND', label: 'VND — Vietnamese Dong' },
	{ value: 'AED', label: 'AED — UAE Dirham' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingWrapper() {
	const { data: settingsRes, isLoading } = useSettings();
	const settings = settingsRes?.data;

	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
	const [isUploadingLogo, setIsUploadingLogo] = useState(false);
	const logoInputRef = useRef<HTMLInputElement>(null);
	const logoPreview = localLogoPreview ?? settings?.logo_url ?? null;

	const updateMutation = useUpdateSettings();

	const form = useForm<TUpdateSettingRequest>({
		resolver: zodResolver(updateSettingSchema),
		values: settings
			? {
				app_name: settings.app_name,
				description: settings.description ?? '',
				logo_url: settings.logo_url ?? '',
				contact_email: settings.contact_email ?? '',
				contact_phone: settings.contact_phone ?? '',
				address: settings.address ?? '',
				social_links: settings.social_links,
				timezone: settings.timezone,
				locale: settings.locale,
				currency: settings.currency,
				faqs: settings.faqs,
				terms_of_service: settings.terms_of_service ?? '',
				privacy_policy: settings.privacy_policy ?? '',
			}
			: undefined,
	});

	// Reflect the app's configured regional preferences as soon as settings load
	useEffect(() => {
		if (settings?.timezone) setAppTimezone(settings.timezone);
		if (settings?.locale) setAppLocale(settings.locale);
		if (settings?.currency) setAppCurrency(settings.currency);
	}, [settings?.timezone, settings?.locale, settings?.currency]);

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Invalid file', { description: 'Please select an image file' });
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error('File too large', { description: 'Image must be less than 5 MB' });
			return;
		}

		setLogoFile(file);
		const reader = new FileReader();
		reader.onloadend = () => setLocalLogoPreview(reader.result as string);
		reader.readAsDataURL(file);
		e.target.value = '';
	};

	const onSubmit = async (values: TUpdateSettingRequest) => {
		let logoUrl = values.logo_url;

		if (logoFile) {
			setIsUploadingLogo(true);
			try {
				logoUrl = await uploadLogo(logoFile);
			} catch (err) {
				toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Failed to upload logo' });
				setIsUploadingLogo(false);
				return;
			}
			setIsUploadingLogo(false);
		}

		updateMutation.mutate(
			{ ...values, logo_url: logoUrl },
			{
				onSuccess: () => {
					setLogoFile(null);
					setLocalLogoPreview(null);
					toast.success('Settings updated', { description: 'Your settings have been updated successfully.' });
				},
				onError: (err) => toast.error('Failed to update settings', { description: err.message }),
			},
		);
	};

	const isSaving = updateMutation.isPending || isUploadingLogo;

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
							<TabsTrigger value="contact"><Contact className="size-3.5 mr-1.5" />Contact</TabsTrigger>
							<TabsTrigger value="regional"><Globe2 className="size-3.5 mr-1.5" />Regional</TabsTrigger>
							<TabsTrigger value="faq"><HelpCircle className="size-3.5 mr-1.5" />FAQ</TabsTrigger>
							<TabsTrigger value="legal"><Scale className="size-3.5 mr-1.5" />Legal</TabsTrigger>
						</TabsList>

						{/* ── General ── */}
						<TabsContent value="general">
							<Card>
								<CardContent className="pt-6 space-y-4">
									<div className="grid gap-2">
										<FormLabel>Logo</FormLabel>
										{logoPreview ? (
											<div className="relative h-24 w-24 overflow-hidden rounded-md ring-1 ring-border bg-muted">
												<Image src={logoPreview} alt="Logo" fill className="object-contain" />
											</div>
										) : (
											<button
												type="button"
												onClick={() => logoInputRef.current?.click()}
												disabled={isSaving}
												className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
											>
												{isUploadingLogo ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
											</button>
										)}
										<div>
											<Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={isSaving}>
												{logoPreview ? 'Change Logo' : 'Upload Logo'}
											</Button>
										</div>
										<input ref={logoInputRef} type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} />
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
											<FormControl><Textarea {...field} placeholder="Short description of your application" disabled={isSaving} rows={3} /></FormControl>
											<FormMessage />
										</FormItem>
									)} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* ── Contact ── */}
						<TabsContent value="contact">
							<Card>
								<CardContent className="pt-6 space-y-4">
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

									<FormField control={form.control} name="social_links" render={({ field }) => (
										<FormItem>
											<FormLabel>Social Media</FormLabel>
											<SocialLinksInput value={field.value ?? []} onChange={field.onChange} />
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
									<FormField control={form.control} name="faqs" render={({ field }) => (
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
									<FormField control={form.control} name="terms_of_service" render={({ field }) => (
										<FormItem>
											<FormLabel>Terms of Service</FormLabel>
											<RichTextEditor content={field.value ?? ''} onChange={field.onChange} placeholder="Write your terms of service..." />
											<FormMessage />
										</FormItem>
									)} />

									<FormField control={form.control} name="privacy_policy" render={({ field }) => (
										<FormItem>
											<FormLabel>Privacy Policy</FormLabel>
											<RichTextEditor content={field.value ?? ''} onChange={field.onChange} placeholder="Write your privacy policy..." />
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
								? <><Loader2 className="size-4 mr-1.5 animate-spin" />{isUploadingLogo ? 'Uploading...' : 'Saving...'}</>
								: 'Save Changes'
							}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
