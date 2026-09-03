'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { TContentLocale, TUpdateSettingRequest } from '@/contracts';
import { ContentLocaleSwitcher } from './content-locale-switcher';

interface AboutTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	contentLocale: TContentLocale;
	onContentLocaleChange: (locale: TContentLocale) => void;
}

export function AboutTab({ form, contentLocale, onContentLocaleChange }: AboutTabProps) {
	return (
		<Card>
			<CardContent className="pt-6 space-y-4">
				<ContentLocaleSwitcher value={contentLocale} onChange={onContentLocaleChange} />
				<FormField control={form.control} name={`translations.about_content.${contentLocale}`} render={({ field }) => (
					<FormItem>
						<FormLabel>About Us</FormLabel>
						<RichTextEditor key={contentLocale} content={field.value ?? ''} onChange={field.onChange} placeholder="Tell visitors about your company..." />
						<FormMessage />
					</FormItem>
				)} />
			</CardContent>
		</Card>
	);
}
