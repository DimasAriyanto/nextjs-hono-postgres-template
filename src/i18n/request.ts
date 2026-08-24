import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { CONTENT_LOCALE_COOKIE, isContentLocale } from '@/i18n/config';
// This runs on every request (it's Next.js server infrastructure, not app-level "FE" code),
// so it reads the DB directly through the service rather than round-tripping through the HTTP
// api layer like feature code does — an HTTP self-fetch here would be both slow per-request and
// break static generation, the same way it already does for the root layout's own getSettings() call.
import { settingService } from '@/server/services';

export default getRequestConfig(async () => {
	const [cookieStore, { defaultLocale, switcherEnabled }] = await Promise.all([
		cookies(),
		settingService.getLanguageConfig(),
	]);
	const raw = cookieStore.get(CONTENT_LOCALE_COOKIE)?.value;
	const locale = switcherEnabled && isContentLocale(raw) ? raw : defaultLocale;

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
