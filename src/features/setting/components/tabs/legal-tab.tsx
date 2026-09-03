'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { TContentLocale, TUpdateSettingRequest } from '@/contracts';
import { ContentLocaleSwitcher } from './content-locale-switcher';

interface LegalTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	contentLocale: TContentLocale;
	onContentLocaleChange: (locale: TContentLocale) => void;
}

export function LegalTab({ form, contentLocale, onContentLocaleChange }: LegalTabProps) {
	return (
		<Card>
			<CardContent className="pt-6 space-y-6">
				<ContentLocaleSwitcher value={contentLocale} onChange={onContentLocaleChange} />

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
	);
}
