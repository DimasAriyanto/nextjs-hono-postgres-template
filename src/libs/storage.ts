interface StorageItem<T> {
	value: T;
	expiresAt?: number;
}

function isExpired(item: StorageItem<unknown>): boolean {
	return item.expiresAt !== undefined && Date.now() > item.expiresAt;
}

export const storage = {
	set<T>(key: string, value: T, ttlMs?: number): void {
		if (typeof window === 'undefined') return;
		const item: StorageItem<T> = {
			value,
			expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
		};
		localStorage.setItem(key, JSON.stringify(item));
	},

	get<T>(key: string): T | null {
		if (typeof window === 'undefined') return null;
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		try {
			const item = JSON.parse(raw) as StorageItem<T>;
			if (isExpired(item)) {
				localStorage.removeItem(key);
				return null;
			}
			return item.value;
		} catch {
			return null;
		}
	},

	remove(key: string): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(key);
	},

	clear(): void {
		if (typeof window === 'undefined') return;
		localStorage.clear();
	},
};

export const sessionStorage_ = {
	set<T>(key: string, value: T): void {
		if (typeof window === 'undefined') return;
		sessionStorage.setItem(key, JSON.stringify(value));
	},

	get<T>(key: string): T | null {
		if (typeof window === 'undefined') return null;
		const raw = sessionStorage.getItem(key);
		if (!raw) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	},

	remove(key: string): void {
		if (typeof window === 'undefined') return;
		sessionStorage.removeItem(key);
	},
};
