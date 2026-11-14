// frontend/src/shared/lib/hooks/useUrlQueryState.ts
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UseUrlQueryStateOptions<T> {
	defaultValue: T;
	serialize?: (val: T) => string;
	deserialize?: (val: string) => T;
	replace?: boolean;
}

/**
 * Реактивный кастомный хук для двусторонней синхронизации переменной состояния с URL query-параметрами (?key=value).
 * При совпадении с defaultValue или пустом значении удаляет параметр из адресной строки для сохранения чистоты URL.
 */
export function useUrlQueryState<T = string>(
	key: string,
	options: UseUrlQueryStateOptions<T>
): [T, (newValue: T | ((prev: T) => T)) => void] {
	const [searchParams, setSearchParams] = useSearchParams();
	const { defaultValue, serialize = String, deserialize, replace = true } = options;

	const value = useMemo<T>(() => {
		const paramVal = searchParams.get(key);
		if (paramVal === null || paramVal === '') {
			return defaultValue;
		}
		if (deserialize) {
			try {
				return deserialize(paramVal);
			} catch {
				return defaultValue;
			}
		}
		return paramVal as unknown as T;
	}, [searchParams, key, defaultValue, deserialize]);

	const setValue = useCallback(
		(newValue: T | ((prev: T) => T)) => {
			setSearchParams(
				(prevParams) => {
					const nextParams = new URLSearchParams(prevParams);
					const currentVal = (() => {
						const paramVal = prevParams.get(key);
						if (paramVal === null || paramVal === '') return defaultValue;
						if (deserialize) {
							try {
								return deserialize(paramVal);
							} catch {
								return defaultValue;
							}
						}
						return paramVal as unknown as T;
					})();

					const resolvedValue =
						typeof newValue === 'function'
							? (newValue as (prev: T) => T)(currentVal)
							: newValue;

					const serialized = serialize(resolvedValue);
					const serializedDefault = serialize(defaultValue);

					if (
						resolvedValue === undefined ||
						resolvedValue === null ||
						serialized === '' ||
						serialized === serializedDefault
					) {
						nextParams.delete(key);
					} else {
						nextParams.set(key, serialized);
					}

					return nextParams;
				},
				{ replace }
			);
		},
		[key, defaultValue, serialize, deserialize, replace, setSearchParams]
	);

	return [value, setValue];
}
