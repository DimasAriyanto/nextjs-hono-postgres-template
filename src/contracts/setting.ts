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
} as const;

export type TSettingGroup = (typeof SETTING_GROUPS)[keyof typeof SETTING_GROUPS];

export const SETTING_KEYS = {
	APP_NAME: 'app_name',
	DESCRIPTION: 'description',
	LOGO_URL: 'logo_url',
	CONTACT_EMAIL: 'contact_email',
	CONTACT_PHONE: 'contact_phone',
	ADDRESS: 'address',
	SOCIAL_LINKS: 'social_links',
	TIMEZONE: 'timezone',
	FAQS: 'faqs',
} as const;

export type TSettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/** Which group each known key belongs to — used when upserting a setting row. */
export const SETTING_KEY_GROUP_MAP: Record<TSettingKey, TSettingGroup> = {
	[SETTING_KEYS.APP_NAME]: SETTING_GROUPS.GENERAL,
	[SETTING_KEYS.DESCRIPTION]: SETTING_GROUPS.GENERAL,
	[SETTING_KEYS.LOGO_URL]: SETTING_GROUPS.GENERAL,
	[SETTING_KEYS.CONTACT_EMAIL]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.CONTACT_PHONE]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.ADDRESS]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.SOCIAL_LINKS]: SETTING_GROUPS.CONTACT,
	[SETTING_KEYS.TIMEZONE]: SETTING_GROUPS.REGIONAL,
	[SETTING_KEYS.FAQS]: SETTING_GROUPS.FAQ,
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

/**
 * Update settings request schema — a partial patch over the known setting keys.
 */
export const updateSettingSchema = z.object({
	app_name: z.string().min(1, 'App name is required').optional(),
	description: z.string().optional(),
	logo_url: z.string().optional(),
	contact_email: z.string().email('Invalid email format').optional().or(z.literal('')),
	contact_phone: z.string().optional(),
	address: z.string().optional(),
	social_links: z.array(socialLinkSchema).optional(),
	timezone: z.string().optional(),
	faqs: z.array(faqItemSchema).optional(),
});

export type TUpdateSettingRequest = z.infer<typeof updateSettingSchema>;

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const settingSchema = z.object({
	app_name: z.string(),
	description: z.string().nullable(),
	logo_url: z.string().nullable(),
	contact_email: z.string().nullable(),
	contact_phone: z.string().nullable(),
	address: z.string().nullable(),
	social_links: z.array(socialLinkSchema),
	timezone: z.string(),
	faqs: z.array(faqItemSchema),
});

export type TSetting = z.infer<typeof settingSchema>;
