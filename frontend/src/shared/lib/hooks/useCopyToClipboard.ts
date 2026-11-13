// frontend/src/shared/lib/hooks/useCopyToClipboard.ts
import { useState, useCallback } from 'react';

/**
 * Хук для безопасного копирования текста в буфер обмена
 * с таймером сброса состояния copied.
 */
export function useCopyToClipboard(
	resetDelay = 2000
): [boolean, (text: string) => Promise<boolean>] {
	const [isCopied, setIsCopied] = useState(false);

	const copy = useCallback(
		async (text: string): Promise<boolean> => {
			if (typeof navigator === 'undefined' || !navigator.clipboard) {
				return false;
			}
			try {
				await navigator.clipboard.writeText(text);
				setIsCopied(true);
				setTimeout(() => {
					setIsCopied(false);
				}, resetDelay);
				return true;
			} catch (error) {
				console.error('Failed to copy to clipboard:', error);
				setIsCopied(false);
				return false;
			}
		},
		[resetDelay]
	);

	return [isCopied, copy];
}
