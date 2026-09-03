'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BannerInput, type PendingBannerFile } from '@/components/banner-input';
import { BANNER_DISPLAY_MODES, type TBannerDisplayMode, type TContentLocale, type TUpdateSettingRequest } from '@/contracts';
import { ContentLocaleSwitcher } from './content-locale-switcher';

const BANNER_DISPLAY_MODE_LABELS: Record<TBannerDisplayMode, string> = {
	carousel: 'Carousel',
	hero: 'Hero',
};

interface BannerTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	isSaving: boolean;
	contentLocale: TContentLocale;
	onContentLocaleChange: (locale: TContentLocale) => void;
	pendingFiles: Record<number, PendingBannerFile>;
	onPendingFilesChange: (files: Record<number, PendingBannerFile>) => void;
}

export function BannerTab({ form, isSaving, contentLocale, onContentLocaleChange, pendingFiles, onPendingFilesChange }: BannerTabProps) {
	return (
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

				<ContentLocaleSwitcher value={contentLocale} onChange={onContentLocaleChange} />
				<FormField control={form.control} name={`translations.banners.${contentLocale}`} render={({ field }) => (
					<FormItem>
						<FormLabel>Home Page Banners</FormLabel>
						<BannerInput
							value={field.value ?? []}
							onChange={field.onChange}
							pendingFiles={pendingFiles}
							onPendingFilesChange={onPendingFilesChange}
							disabled={isSaving}
						/>
						<FormMessage />
					</FormItem>
				)} />
			</CardContent>
		</Card>
	);
}
