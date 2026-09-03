'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { FaqInput } from '@/components/faq-input';
import type { TContentLocale, TUpdateSettingRequest } from '@/contracts';
import { ContentLocaleSwitcher } from './content-locale-switcher';

interface FaqTabProps {
	form: UseFormReturn<TUpdateSettingRequest>;
	contentLocale: TContentLocale;
	onContentLocaleChange: (locale: TContentLocale) => void;
}

export function FaqTab({ form, contentLocale, onContentLocaleChange }: FaqTabProps) {
	return (
		<Card>
			<CardContent className="pt-6 space-y-4">
				<ContentLocaleSwitcher value={contentLocale} onChange={onContentLocaleChange} />
				<FormField control={form.control} name={`translations.faqs.${contentLocale}`} render={({ field }) => (
					<FormItem>
						<FormLabel>Frequently Asked Questions</FormLabel>
						<FaqInput value={field.value ?? []} onChange={field.onChange} />
						<FormMessage />
					</FormItem>
				)} />
			</CardContent>
		</Card>
	);
}
