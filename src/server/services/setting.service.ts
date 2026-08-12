import { settingRepository } from '@/server/repositories';
import { SETTING_KEYS, SETTING_KEY_GROUP_MAP, type TFaqItem, type TSetting, type TSocialLink, type TUpdateSettingRequest } from '@/contracts/setting';

const DEFAULTS: TSetting = {
	app_name: process.env.APP_NAME || 'My App',
	description: null,
	logo_url: null,
	contact_email: null,
	contact_phone: null,
	address: null,
	social_links: [],
	timezone: 'Asia/Jakarta',
	locale: 'en-US',
	currency: 'IDR',
	faqs: [],
	terms_of_service: null,
	privacy_policy: null,
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
			contact_email: (byKey.get(SETTING_KEYS.CONTACT_EMAIL) as string | undefined) ?? DEFAULTS.contact_email,
			contact_phone: (byKey.get(SETTING_KEYS.CONTACT_PHONE) as string | undefined) ?? DEFAULTS.contact_phone,
			address: (byKey.get(SETTING_KEYS.ADDRESS) as string | undefined) ?? DEFAULTS.address,
			social_links: (byKey.get(SETTING_KEYS.SOCIAL_LINKS) as TSocialLink[] | undefined) ?? DEFAULTS.social_links,
			timezone: (byKey.get(SETTING_KEYS.TIMEZONE) as string | undefined) ?? DEFAULTS.timezone,
			locale: (byKey.get(SETTING_KEYS.LOCALE) as string | undefined) ?? DEFAULTS.locale,
			currency: (byKey.get(SETTING_KEYS.CURRENCY) as string | undefined) ?? DEFAULTS.currency,
			faqs: (byKey.get(SETTING_KEYS.FAQS) as TFaqItem[] | undefined) ?? DEFAULTS.faqs,
			terms_of_service: (byKey.get(SETTING_KEYS.TERMS_OF_SERVICE) as string | undefined) ?? DEFAULTS.terms_of_service,
			privacy_policy: (byKey.get(SETTING_KEYS.PRIVACY_POLICY) as string | undefined) ?? DEFAULTS.privacy_policy,
		};
	}

	/**
	 * Update settings — only the provided keys are upserted, the rest are left untouched
	 */
	async updateSettings(data: TUpdateSettingRequest, actorId?: string): Promise<TSetting> {
		const entries = Object.entries(data) as [keyof TUpdateSettingRequest, unknown][];

		for (const [key, value] of entries) {
			if (value === undefined) continue;
			await settingRepository.upsert(key, SETTING_KEY_GROUP_MAP[key], value, actorId);
		}

		return this.getSettings();
	}
}

export const settingService = new SettingService();
