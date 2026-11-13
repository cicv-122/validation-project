import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any rapidly changing value.
 * @param value The value to debounce
 * @param delay Milliseconds delay
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}
