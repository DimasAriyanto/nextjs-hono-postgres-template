'use client';

import { useCallback } from 'react';
import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CONTENT_LOCALE_COOKIE, CONTENT_LOCALES, type TContentLocale } from '@/i18n/config';

export function LanguageSwitcher() {
	const locale = useLocale() as TContentLocale;
	const t = useTranslations('language');
	const router = useRouter();

	const setLocale = useCallback((next: TContentLocale) => {
		if (next === locale) return;
		document.cookie = `${CONTENT_LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
		router.refresh();
	}, [locale, router]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={t('label')}>
					<Languages className="size-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				{CONTENT_LOCALES.map((option) => (
					<DropdownMenuItem
						key={option}
						onClick={() => setLocale(option)}
						className="flex items-center justify-between gap-2 cursor-pointer"
					>
						{t(option)}
						{locale === option && <span className="text-xs text-muted-foreground">✓</span>}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
