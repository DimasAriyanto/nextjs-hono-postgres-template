import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === 'undefined') return initialValue;
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch {
			return initialValue;
		}
	});

	const setValue = useCallback(
		(value: T | ((prev: T) => T)) => {
			setStoredValue((prev) => {
				const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
				try {
					window.localStorage.setItem(key, JSON.stringify(next));
				} catch {
					// quota exceeded or SSR — silently skip
				}
				return next;
			});
		},
		[key],
	);

	const remove = useCallback(() => {
		window.localStorage.removeItem(key);
		setStoredValue(initialValue);
	}, [key, initialValue]);

	useEffect(() => {
		const handler = (e: StorageEvent) => {
			if (e.key !== key) return;
			try {
				setStoredValue(e.newValue ? (JSON.parse(e.newValue) as T) : initialValue);
			} catch {
				// invalid JSON
			}
		};
		window.addEventListener('storage', handler);
		return () => window.removeEventListener('storage', handler);
	}, [key, initialValue]);

	return [storedValue, setValue, remove] as const;
}
