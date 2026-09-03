'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useConvertCurrency } from '@/features/currency/hooks/use-currency';
import { LOCALE_OPTIONS } from '@/libs/dayjs';
import { CONTENT_LOCALES, type TUpdateSettingRequest } from '@/contracts';
import { CONTENT_LOCALE_LABELS } from './content-locale-switcher';

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

const CURRENCY_OPTIONS = [
	{ value: 'IDR', label: 'IDR — Indonesian Rupiah' },
	{ value: 'USD', label: 'USD — US Dollar' },
];

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

interface RegionalTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	isSaving: boolean;
}

export function RegionalTab({ form, isSaving }: RegionalTabProps) {
	return (
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
	);
}
