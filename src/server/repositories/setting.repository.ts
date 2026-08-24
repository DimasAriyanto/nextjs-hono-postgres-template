import { and, eq } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { AppSettingsTable, type TSelectAppSetting } from '@/server/databases/schemas/settings.schema';

export class SettingRepository {
	/**
	 * Find all setting rows (every key, every locale)
	 */
	async findAll(): Promise<TSelectAppSetting[]> {
		return db.select().from(AppSettingsTable);
	}

	/**
	 * Find a single setting row by key + locale ('' for a global/non-translatable key)
	 */
	async findByKey(key: string, locale = ''): Promise<TSelectAppSetting | undefined> {
		const [row] = await db
			.select()
			.from(AppSettingsTable)
			.where(and(eq(AppSettingsTable.key, key), eq(AppSettingsTable.locale, locale)))
			.limit(1);

		return row;
	}

	/**
	 * Upsert a setting row by key + locale ('' for a global/non-translatable key)
	 */
	async upsert(key: string, group: string, value: unknown, locale = '', actorId?: string): Promise<TSelectAppSetting> {
		const [row] = await db
			.insert(AppSettingsTable)
			.values({ key, locale, group, value, created_by: actorId, updated_by: actorId })
			.onConflictDoUpdate({
				target: [AppSettingsTable.key, AppSettingsTable.locale],
				set: { value, group, updated_by: actorId, updated_at: new Date().toISOString() },
			})
			.returning();

		return row;
	}
}

export const settingRepository = new SettingRepository();
