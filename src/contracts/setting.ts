import { z } from 'zod';

// ============================================
// SETTING KEYS / GROUPS
// ============================================
// Storage is a dynamic key/group/value store (see AppSettingsTable) so new
// settings can be introduced later without a migration. These constants are
// the app-level contract for the settings this template ships with.

export const SETTING_GROUPS = {
	GENERAL: 'general',
	CONTACT: 'contact',
	REGIONAL: 'regional',
	FAQ: 'faq',
	LEGAL: 'legal',
	APPEARANCE: 'appearance',
	BANNER: 'banner',
} as const;

export type TSettingGroup = (typeof SETTING_GROUPS)[keyof typeof SETTING_GROUPS];

export const SETTING_KEYS = {
	APP_NAME: 'app_name',
	DESCRIPTION: 'description',
	LOGO_URL: 'logo_url',
	ABOUT_CONTENT: 'about_content',
	CONTACT_EMAIL: 'contact_email',
	CONTACT_PHONE: 'contact_phone',
	ADDRESS: 'address',
	SOCIAL_LINKS: 'social_links',
	MAPS_URL: 'maps_url',
	BUSINESS_HOURS: 'business_hours',
	TIMEZONE: 'timezone',
	LOCALE: 'locale',
	CURRENCY: 'currency',
	FAQS: 'faqs',
	TERMS_OF_SERVICE: 'terms_of_service',
	PRIVACY_POLICY: 'privacy_policy',
	PRIMARY_COLOR: 'primary_color',
	BANNERS: 'banners',
} as const;

export type TSettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/** Which group each known key belongs to — used when upserting a setting row. */
export const SETTING_KEY_GROUP_MAP: Record<TSettingKey, TSettingGroup> = {
	[SETTING_KEYS.APP_NAME]: SETTING_GROUPS.GENERAL,
	[SETTING_KEYS.DESCRIPTION]: SETTING_GROUPS.GENERAL,
	[SETTING_KEYS.LOGO_URL]: SETTING_GROUPS.GENERAL,
	[SETTING_KEYS.ABOUT_CONTENT]: SETTING_GROUPS.GENERAL,
	[SETTING_KEYS.CONTACT_EMAIL]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.CONTACT_PHONE]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.ADDRESS]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.SOCIAL_LINKS]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.MAPS_URL]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.BUSINESS_HOURS]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.TIMEZONE]: SETTING_GROUPS.REGIONAL,
	[SETTING_KEYS.LOCALE]: SETTING_GROUPS.REGIONAL,
	[SETTING_KEYS.CURRENCY]: SETTING_GROUPS.REGIONAL,
	[SETTING_KEYS.FAQS]: SETTING_GROUPS.FAQ,
	[SETTING_KEYS.TERMS_OF_SERVICE]: SETTING_GROUPS.LEGAL,
	[SETTING_KEYS.PRIVACY_POLICY]: SETTING_GROUPS.LEGAL,
	[SETTING_KEYS.PRIMARY_COLOR]: SETTING_GROUPS.APPEARANCE,
	[SETTING_KEYS.BANNERS]: SETTING_GROUPS.BANNER,
};

// ============================================
// REQUEST SCHEMAS
// ============================================

export const socialLinkSchema = z.object({
	platform: z.string().min(1),
	url: z.string().min(1),
});

export type TSocialLink = z.infer<typeof socialLinkSchema>;

export const faqItemSchema = z.object({
	question: z.string().min(1, 'Question is required'),
	answer: z.string().min(1, 'Answer is required'),
});

export type TFaqItem = z.infer<typeof faqItemSchema>;

export const BANNER_TEXT_ALIGNS = ['left', 'center', 'right'] as const;

export type TBannerTextAlign = (typeof BANNER_TEXT_ALIGNS)[number];

export const BANNER_MEDIA_TYPES = ['image', 'video'] as const;

export type TBannerMediaType = (typeof BANNER_MEDIA_TYPES)[number];

export const bannerItemSchema = z.object({
	image_url: z.string().min(1, 'Media is required'),
	media_type: z.enum(BANNER_MEDIA_TYPES).optional(),
	title: z.string().optional(),
	subtitle: z.string().optional(),
	button_label: z.string().optional(),
	button_link: z.string().optional(),
	text_align: z.enum(BANNER_TEXT_ALIGNS).optional(),
});

export type TBannerItem = z.infer<typeof bannerItemSchema>;

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export type TWeekday = (typeof WEEKDAYS)[number];

export const businessHourSchema = z.object({
	day: z.enum(WEEKDAYS),
	is_closed: z.boolean(),
	open_time: z.string().optional(),
	close_time: z.string().optional(),
});

export type TBusinessHour = z.infer<typeof businessHourSchema>;

/** Accepts either a raw Maps embed URL or a full `<iframe>` snippet copy-pasted from Google Maps and returns just the URL. */
export function extractMapsEmbedUrl(value: string): string {
	const match = value.match(/src=["']([^"']+)["']/i);
	return (match ? match[1] : value).trim();
}

/**
 * Update settings request schema — a partial patch over the known setting keys.
 */
export const updateSettingSchema = z.object({
	app_name: z.string().min(1, 'App name is required').optional(),
	description: z.string().optional(),
	logo_url: z.string().optional(),
	about_content: z.string().optional(),
	contact_email: z.string().email('Invalid email format').optional().or(z.literal('')),
	contact_phone: z.string().optional(),
	address: z.string().optional(),
	social_links: z.array(socialLinkSchema).optional(),
	maps_url: z.string().optional(),
	business_hours: z.array(businessHourSchema).optional(),
	timezone: z.string().optional(),
	locale: z.string().optional(),
	currency: z.string().optional(),
	faqs: z.array(faqItemSchema).optional(),
	terms_of_service: z.string().optional(),
	privacy_policy: z.string().optional(),
	primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g. #171717)').optional().or(z.literal('')),
	banners: z.array(bannerItemSchema).optional(),
});

export type TUpdateSettingRequest = z.infer<typeof updateSettingSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const settingSchema = z.object({
	app_name: z.string(),
	description: z.string().nullable(),
	logo_url: z.string().nullable(),
	about_content: z.string().nullable(),
	contact_email: z.string().nullable(),
	contact_phone: z.string().nullable(),
	address: z.string().nullable(),
	social_links: z.array(socialLinkSchema),
	maps_url: z.string().nullable(),
	business_hours: z.array(businessHourSchema),
	timezone: z.string(),
	locale: z.string(),
	currency: z.string(),
	faqs: z.array(faqItemSchema),
	terms_of_service: z.string().nullable(),
	privacy_policy: z.string().nullable(),
	primary_color: z.string().nullable(),
	banners: z.array(bannerItemSchema),
});

export type TSetting = z.infer<typeof settingSchema>;
