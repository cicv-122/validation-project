// frontend/src/shared/lib/hooks/useClickOutside.ts
import { useEffect, RefObject } from 'react';

/**
 * Хук для отслеживания клика вне указанного элемента (ref).
 * Поддерживает mousedown и touchstart.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
	ref: RefObject<T | null> | Array<RefObject<T | null>>,
	handler: (event: MouseEvent | TouchEvent) => void,
	enabled = true
): void {
	useEffect(() => {
		if (!enabled || typeof document === 'undefined') return;

		const listener = (event: MouseEvent | TouchEvent) => {
			const target = event.target as Node | null;
			if (!target) return;

			const refs = Array.isArray(ref) ? ref : [ref];
			const isInside = refs.some((r) => r.current && r.current.contains(target));

			if (!isInside) {
				handler(event);
			}
		};

		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [ref, handler, enabled]);
}
