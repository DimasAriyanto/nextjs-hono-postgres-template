import { settingRepository } from '@/server/repositories';
import {
	CONTENT_LOCALES,
	DEFAULT_CONTENT_LOCALE,
	SETTING_KEYS,
	SETTING_KEY_GROUP_MAP,
	TRANSLATABLE_SETTING_KEYS,
	WEEKDAYS,
	extractMapsEmbedUrl,
	isContentLocale,
	type TBusinessHour,
	type TContentLocale,
	type TSetting,
	type TSettingKey,
	type TTranslatableSettingKey,
	type TUpdateSettingRequest,
} from '@/contracts/setting';

/**
 * Fill in any weekday missing from a partially-configured business hours list (defaulting to
 * open 09:00–18:00), and return all 7 days sorted Monday–Sunday. An empty list — business hours
 * never configured at all — is left as-is so the section can stay hidden on the public page.
 */
function normalizeBusinessHours(rows: TBusinessHour[]): TBusinessHour[] {
	if (rows.length === 0) return rows;
	return WEEKDAYS.map(
		(day) => rows.find((row) => row.day === day) ?? { day, is_closed: false, open_time: '09:00', close_time: '18:00' },
	);
}

const DEFAULTS: TSetting = {
	app_name: process.env.APP_NAME || 'My App',
	description: null,
	logo_url: null,
	about_content: null,
	contact_email: null,
	contact_phone: null,
	address: null,
	social_links: [],
	maps_url: null,
	business_hours: [],
	timezone: 'Asia/Jakarta',
	locale: 'en-US',
	currency: 'IDR',
	faqs: [],
	terms_of_service: null,
	privacy_policy: null,
	primary_color: null,
	banners: [],
	default_content_locale: isContentLocale(process.env.DEFAULT_CONTENT_LOCALE) ? process.env.DEFAULT_CONTENT_LOCALE : DEFAULT_CONTENT_LOCALE,
	language_switcher_enabled: process.env.LANGUAGE_SWITCHER_ENABLED !== 'false',
	ga_id: null,
	gtm_id: null,
	google_site_verification: null,
	og_image_url: null,
	translations: {
		about_content: { id: null, en: null },
		terms_of_service: { id: null, en: null },
		privacy_policy: { id: null, en: null },
		faqs: { id: [], en: [] },
		banners: { id: [], en: [] },
	},
};

export class SettingService {
	/**
	 * Get all settings, assembled from key/value rows with defaults for anything not yet set.
	 * Translatable keys (about_content, terms_of_service, privacy_policy, faqs, banners) are
	 * resolved for `contentLocale` — defaulting to the admin-configured default content locale
	 * (Settings > Regional > Default Language, itself defaulting to `DEFAULT_CONTENT_LOCALE` env
	 * var) when omitted — falling back to that same default locale, then to defaults. The full
	 * `translations` bundle is always returned too, for the admin form to edit every locale at
	 * once.
	 */
	async getSettings(contentLocale?: TContentLocale): Promise<TSetting> {
		const rows = await settingRepository.findAll();
		const byKeyLocale = new Map(rows.map((row) => [`${row.key}:${row.locale}`, row.value]));

		const global = <T>(key: TSettingKey, fallback: T): T => (byKeyLocale.get(`${key}:`) as T | undefined) ?? fallback;

		const defaultContentLocale = global(SETTING_KEYS.DEFAULT_CONTENT_LOCALE, DEFAULTS.default_content_locale);
		const effectiveLocale = contentLocale ?? defaultContentLocale;

		const perLocale = <T>(key: TTranslatableSettingKey, locale: TContentLocale, fallback: T): T =>
			(byKeyLocale.get(`${key}:${locale}`) as T | undefined) ?? fallback;

		const resolved = <T>(key: TTranslatableSettingKey, fallback: T): T =>
			perLocale(key, effectiveLocale, perLocale(key, defaultContentLocale, fallback));

		const allLocales = <T>(key: TTranslatableSettingKey, fallback: T): Record<TContentLocale, T> =>
			Object.fromEntries(CONTENT_LOCALES.map((locale) => [locale, perLocale(key, locale, fallback)])) as Record<TContentLocale, T>;

		return {
			app_name: global(SETTING_KEYS.APP_NAME, DEFAULTS.app_name),
			description: global(SETTING_KEYS.DESCRIPTION, DEFAULTS.description),
			logo_url: global(SETTING_KEYS.LOGO_URL, DEFAULTS.logo_url),
			about_content: resolved(SETTING_KEYS.ABOUT_CONTENT, DEFAULTS.about_content),
			contact_email: global(SETTING_KEYS.CONTACT_EMAIL, DEFAULTS.contact_email),
			contact_phone: global(SETTING_KEYS.CONTACT_PHONE, DEFAULTS.contact_phone),
			address: global(SETTING_KEYS.ADDRESS, DEFAULTS.address),
			social_links: global(SETTING_KEYS.SOCIAL_LINKS, DEFAULTS.social_links),
			maps_url: global(SETTING_KEYS.MAPS_URL, DEFAULTS.maps_url),
			business_hours: normalizeBusinessHours(global(SETTING_KEYS.BUSINESS_HOURS, DEFAULTS.business_hours)),
			timezone: global(SETTING_KEYS.TIMEZONE, DEFAULTS.timezone),
			locale: global(SETTING_KEYS.LOCALE, DEFAULTS.locale),
			currency: global(SETTING_KEYS.CURRENCY, DEFAULTS.currency),
			faqs: resolved(SETTING_KEYS.FAQS, DEFAULTS.faqs),
			terms_of_service: resolved(SETTING_KEYS.TERMS_OF_SERVICE, DEFAULTS.terms_of_service),
			privacy_policy: resolved(SETTING_KEYS.PRIVACY_POLICY, DEFAULTS.privacy_policy),
			primary_color: global(SETTING_KEYS.PRIMARY_COLOR, DEFAULTS.primary_color) || DEFAULTS.primary_color,
			banners: resolved(SETTING_KEYS.BANNERS, DEFAULTS.banners),
			default_content_locale: defaultContentLocale,
			language_switcher_enabled: global(SETTING_KEYS.LANGUAGE_SWITCHER_ENABLED, DEFAULTS.language_switcher_enabled),
			ga_id: global(SETTING_KEYS.GA_ID, DEFAULTS.ga_id),
			gtm_id: global(SETTING_KEYS.GTM_ID, DEFAULTS.gtm_id),
			google_site_verification: global(SETTING_KEYS.GOOGLE_SITE_VERIFICATION, DEFAULTS.google_site_verification),
			og_image_url: global(SETTING_KEYS.OG_IMAGE_URL, DEFAULTS.og_image_url),
			translations: {
				about_content: allLocales(SETTING_KEYS.ABOUT_CONTENT, DEFAULTS.about_content),
				terms_of_service: allLocales(SETTING_KEYS.TERMS_OF_SERVICE, DEFAULTS.terms_of_service),
				privacy_policy: allLocales(SETTING_KEYS.PRIVACY_POLICY, DEFAULTS.privacy_policy),
				faqs: allLocales(SETTING_KEYS.FAQS, DEFAULTS.faqs),
				banners: allLocales(SETTING_KEYS.BANNERS, DEFAULTS.banners),
			},
		};
	}

	/**
	 * Cheap, targeted read for `src/i18n/request.ts` — that file resolves the locale for every
	 * single request, so it reads just these two global rows instead of the full `getSettings()`
	 * composition (which loads every setting).
	 */
	async getLanguageConfig(): Promise<{ defaultLocale: TContentLocale; switcherEnabled: boolean }> {
		const [defaultRow, enabledRow] = await Promise.all([
			settingRepository.findByKey(SETTING_KEYS.DEFAULT_CONTENT_LOCALE),
			settingRepository.findByKey(SETTING_KEYS.LANGUAGE_SWITCHER_ENABLED),
		]);
		const rawDefaultLocale = defaultRow?.value as string | undefined;

		return {
			defaultLocale: isContentLocale(rawDefaultLocale) ? rawDefaultLocale : DEFAULTS.default_content_locale,
			switcherEnabled: typeof enabledRow?.value === 'boolean' ? enabledRow.value : DEFAULTS.language_switcher_enabled,
		};
	}

	/**
	 * Update settings — only the provided keys are upserted, the rest are left untouched.
	 * Non-translatable fields are stored globally (locale ''); `translations` entries are
	 * stored one row per (key, content locale).
	 */
	async updateSettings(data: TUpdateSettingRequest, actorId?: string): Promise<TSetting> {
		const { translations, ...globalFields } = data;
		const entries = Object.entries(globalFields) as [Exclude<keyof TUpdateSettingRequest, 'translations'>, unknown][];

		for (const [key, value] of entries) {
			if (value === undefined) continue;
			const normalizedValue = key === SETTING_KEYS.MAPS_URL && typeof value === 'string' ? extractMapsEmbedUrl(value) : value;
			await settingRepository.upsert(key, SETTING_KEY_GROUP_MAP[key], normalizedValue, '', actorId);
		}

		if (translations) {
			for (const key of TRANSLATABLE_SETTING_KEYS) {
				const perLocaleValues = translations[key];
				if (!perLocaleValues) continue;

				for (const [locale, value] of Object.entries(perLocaleValues) as [TContentLocale, unknown][]) {
					if (value === undefined) continue;
					await settingRepository.upsert(key, SETTING_KEY_GROUP_MAP[key], value, locale, actorId);
				}
			}
		}

		return this.getSettings();
	}
}

export const settingService = new SettingService();
