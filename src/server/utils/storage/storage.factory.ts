import { StorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';
import { S3StorageProvider } from './s3.storage';
import { SupabaseStorageProvider } from './supabase.storage';

export type StorageDriver = 'local' | 's3' | 'supabase';

let instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
	if (instance) return instance;

	const driver = (process.env.STORAGE_DRIVER ?? 'local') as StorageDriver;

	switch (driver) {
		case 's3':
			instance = new S3StorageProvider();
			break;
		case 'supabase':
			instance = new SupabaseStorageProvider();
			break;
		case 'local':
		default:
			instance = new LocalStorageProvider();
			break;
	}

	return instance;
}
