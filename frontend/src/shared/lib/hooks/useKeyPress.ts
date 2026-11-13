// frontend/src/shared/lib/hooks/useKeyPress.ts
import { useEffect } from 'react';

/**
 * Хук для отслеживания нажатия клавиши (по умолчанию 'Escape') с автоматической очисткой слушателя.
 */
export function useKeyPress(
	key: string,
	handler: (event: KeyboardEvent) => void,
	enabled = true
): void {
	useEffect(() => {
		if (!enabled || typeof window === 'undefined') return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === key) {
				handler(event);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [key, handler, enabled]);
}
