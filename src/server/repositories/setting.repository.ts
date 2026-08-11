import { eq } from 'drizzle-orm';
import { db } from '@/server/databases/client';
import { AppSettingsTable, type TSelectAppSetting } from '@/server/databases/schemas/settings.schema';

export class SettingRepository {
	/**
	 * Find all setting rows
	 */
	async findAll(): Promise<TSelectAppSetting[]> {
		return db.select().from(AppSettingsTable);
	}

	/**
	 * Find a single setting row by key
	 */
	async findByKey(key: string): Promise<TSelectAppSetting | undefined> {
		const [row] = await db.select().from(AppSettingsTable).where(eq(AppSettingsTable.key, key)).limit(1);

		return row;
	}

	/**
	 * Upsert a setting row by key
	 */
	async upsert(key: string, group: string, value: unknown, actorId?: string): Promise<TSelectAppSetting> {
		const [row] = await db
			.insert(AppSettingsTable)
			.values({ key, group, value, created_by: actorId, updated_by: actorId })
			.onConflictDoUpdate({
				target: AppSettingsTable.key,
				set: { value, group, updated_by: actorId, updated_at: new Date().toISOString() },
			})
			.returning();

		return row;
	}
}

export const settingRepository = new SettingRepository();
