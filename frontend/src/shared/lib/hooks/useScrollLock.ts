// frontend/src/shared/lib/hooks/useScrollLock.ts
import { useEffect } from 'react';

/**
 * Блокирует прокрутку страницы (document.body.style.overflow = 'hidden')
 * при активном состоянии (модалка, шторка, меню), и восстанавливает при закрытии или размонтировании.
 */
export function useScrollLock(isLocked: boolean): void {
	useEffect(() => {
		if (typeof document === 'undefined' || !isLocked) return;

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [isLocked]);
}
