// frontend/src/shared/lib/hooks/useDisclosure.ts
import { useState, useCallback } from 'react';

export interface UseDisclosureReturn {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
	setIsOpen: (isOpen: boolean) => void;
}

export function useDisclosure(
	initialState = false,
	callbacks?: { onOpen?: () => void; onClose?: () => void }
): UseDisclosureReturn {
	const [isOpen, setIsOpen] = useState(initialState);

	const open = useCallback(() => {
		setIsOpen(true);
		callbacks?.onOpen?.();
	}, [callbacks]);

	const close = useCallback(() => {
		setIsOpen(false);
		callbacks?.onClose?.();
	}, [callbacks]);

	const toggle = useCallback(() => {
		setIsOpen((prev) => {
			const next = !prev;
			if (next) callbacks?.onOpen?.();
			else callbacks?.onClose?.();
			return next;
		});
	}, [callbacks]);

	return { isOpen, open, close, toggle, setIsOpen };
}
