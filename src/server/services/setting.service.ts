import { settingRepository } from '@/server/repositories';
import { extractMapsEmbedUrl, SETTING_KEYS, SETTING_KEY_GROUP_MAP, WEEKDAYS, type TBannerItem, type TBusinessHour, type TFaqItem, type TSetting, type TSocialLink, type TUpdateSettingRequest } from '@/contracts/setting';

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
};

export class SettingService {
	/**
	 * Get all settings, assembled from key/value rows with defaults for anything not yet set
	 */
	async getSettings(): Promise<TSetting> {
		const rows = await settingRepository.findAll();
		const byKey = new Map(rows.map((row) => [row.key, row.value]));

		return {
			app_name: (byKey.get(SETTING_KEYS.APP_NAME) as string | undefined) ?? DEFAULTS.app_name,
			description: (byKey.get(SETTING_KEYS.DESCRIPTION) as string | undefined) ?? DEFAULTS.description,
			logo_url: (byKey.get(SETTING_KEYS.LOGO_URL) as string | undefined) ?? DEFAULTS.logo_url,
			about_content: (byKey.get(SETTING_KEYS.ABOUT_CONTENT) as string | undefined) ?? DEFAULTS.about_content,
			contact_email: (byKey.get(SETTING_KEYS.CONTACT_EMAIL) as string | undefined) ?? DEFAULTS.contact_email,
			contact_phone: (byKey.get(SETTING_KEYS.CONTACT_PHONE) as string | undefined) ?? DEFAULTS.contact_phone,
			address: (byKey.get(SETTING_KEYS.ADDRESS) as string | undefined) ?? DEFAULTS.address,
			social_links: (byKey.get(SETTING_KEYS.SOCIAL_LINKS) as TSocialLink[] | undefined) ?? DEFAULTS.social_links,
			maps_url: (byKey.get(SETTING_KEYS.MAPS_URL) as string | undefined) ?? DEFAULTS.maps_url,
			business_hours: normalizeBusinessHours((byKey.get(SETTING_KEYS.BUSINESS_HOURS) as TBusinessHour[] | undefined) ?? DEFAULTS.business_hours),
			timezone: (byKey.get(SETTING_KEYS.TIMEZONE) as string | undefined) ?? DEFAULTS.timezone,
			locale: (byKey.get(SETTING_KEYS.LOCALE) as string | undefined) ?? DEFAULTS.locale,
			currency: (byKey.get(SETTING_KEYS.CURRENCY) as string | undefined) ?? DEFAULTS.currency,
			faqs: (byKey.get(SETTING_KEYS.FAQS) as TFaqItem[] | undefined) ?? DEFAULTS.faqs,
			terms_of_service: (byKey.get(SETTING_KEYS.TERMS_OF_SERVICE) as string | undefined) ?? DEFAULTS.terms_of_service,
			privacy_policy: (byKey.get(SETTING_KEYS.PRIVACY_POLICY) as string | undefined) ?? DEFAULTS.privacy_policy,
			primary_color: (byKey.get(SETTING_KEYS.PRIMARY_COLOR) as string | undefined) || DEFAULTS.primary_color,
			banners: (byKey.get(SETTING_KEYS.BANNERS) as TBannerItem[] | undefined) ?? DEFAULTS.banners,
		};
	}

	/**
	 * Update settings — only the provided keys are upserted, the rest are left untouched
	 */
	async updateSettings(data: TUpdateSettingRequest, actorId?: string): Promise<TSetting> {
		const entries = Object.entries(data) as [keyof TUpdateSettingRequest, unknown][];

		for (const [key, value] of entries) {
			if (value === undefined) continue;
			const normalizedValue = key === SETTING_KEYS.MAPS_URL && typeof value === 'string' ? extractMapsEmbedUrl(value) : value;
			await settingRepository.upsert(key, SETTING_KEY_GROUP_MAP[key], normalizedValue, actorId);
		}

		return this.getSettings();
	}
}

export const settingService = new SettingService();
