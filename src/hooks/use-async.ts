import { useState, useCallback } from 'react';

interface AsyncState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
}

export function useAsync<T, A extends unknown[]>(
	asyncFn: (...args: A) => Promise<T>,
) {
	const [state, setState] = useState<AsyncState<T>>({
		data: null,
		loading: false,
		error: null,
	});

	const execute = useCallback(
		async (...args: A) => {
			setState({ data: null, loading: true, error: null });
			try {
				const data = await asyncFn(...args);
				setState({ data, loading: false, error: null });
				return data;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setState({ data: null, loading: false, error });
				throw error;
			}
		},
		[asyncFn],
	);

	const reset = useCallback(() => {
		setState({ data: null, loading: false, error: null });
	}, []);

	return { ...state, execute, reset };
}
