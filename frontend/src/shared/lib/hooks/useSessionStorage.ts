// frontend/src/shared/lib/hooks/useSessionStorage.ts
import { useState } from 'react';

/**
 * Безопасная утилита для синхронного чтения/записи в sessionStorage с защитой от SSR и приватного режима
 */
export const safeSessionStorage = {
	getItem(key: string): string | null {
		try {
			return typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
		} catch {
			return null;
		}
	},
	setItem(key: string, value: string): void {
		try {
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem(key, value);
			}
		} catch (error) {
			console.error(`Error writing sessionStorage key "${key}":`, error);
		}
	},
	removeItem(key: string): void {
		try {
			if (typeof window !== 'undefined') {
				window.sessionStorage.removeItem(key);
			}
		} catch (error) {
			console.error(`Error removing sessionStorage key "${key}":`, error);
		}
	},
};

/**
 * React-хук для сохранения и реактивной синхронизации состояния с sessionStorage
 */
export function useSessionStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			if (typeof window === 'undefined') return initialValue;
			const item = window.sessionStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading sessionStorage key "${key}":`, error);
			return initialValue;
		}
	});

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			setStoredValue((prev) => {
				const valueToStore = value instanceof Function ? value(prev) : value;
				if (typeof window !== 'undefined') {
					window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
				}
				return valueToStore;
			});
		} catch (error) {
			console.error(`Error setting sessionStorage key "${key}":`, error);
		}
	};

	const removeValue = () => {
		try {
			if (typeof window !== 'undefined') {
				window.sessionStorage.removeItem(key);
			}
			setStoredValue(initialValue);
		} catch (error) {
			console.error(`Error removing sessionStorage key "${key}":`, error);
		}
	};

	return [storedValue, setValue, removeValue];
}
