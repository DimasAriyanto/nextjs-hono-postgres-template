'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTENT_LOCALES, type TContentLocale } from '@/contracts';

export const CONTENT_LOCALE_LABELS: Record<TContentLocale, string> = {
	id: 'Indonesian',
	en: 'English',
};

interface ContentLocaleSwitcherProps {
	value: TContentLocale;
	onChange: (locale: TContentLocale) => void;
}

export function ContentLocaleSwitcher({ value, onChange }: ContentLocaleSwitcherProps) {
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
