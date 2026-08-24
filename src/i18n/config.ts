export const CONTENT_LOCALES = ['id', 'en'] as const;

export type TContentLocale = (typeof CONTENT_LOCALES)[number];

export const DEFAULT_CONTENT_LOCALE: TContentLocale = 'id';

export const CONTENT_LOCALE_COOKIE = 'NEXT_LOCALE';

export function isContentLocale(value: string | undefined | null): value is TContentLocale {
	return !!value && (CONTENT_LOCALES as readonly string[]).includes(value);
}
