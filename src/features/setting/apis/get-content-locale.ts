import { getLocale } from 'next-intl/server';
import type { TContentLocale } from '@/contracts';

/**
 * The current request's content locale (from next-intl, resolved via the
 * `NEXT_LOCALE` cookie in `src/i18n/request.ts`). Server Components pass this
 * into `getSettings(contentLocale)` to resolve translatable content.
 *
 * Kept in its own file (rather than `setting.api.ts`, which is also imported
 * by client hooks) — `next-intl/server` is only safe to import from Server
 * Components, and this file is never imported by the client hooks.
 */
export async function getContentLocale(): Promise<TContentLocale> {
	return (await getLocale()) as TContentLocale;
}
