// frontend/src/shared/ui/modal/Modal.tsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useKeyPress, useScrollLock } from '../../lib';
import { CloseIcon } from '../icons';

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: React.ReactNode;
	subtitle?: React.ReactNode;
	children: React.ReactNode;
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
	showCloseButton?: boolean;
	className?: string;
	bodyClassName?: string;
	zIndex?: number;
}

const MAX_WIDTH_MAP = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
	'2xl': 'max-w-2xl',
	'3xl': 'max-w-3xl',
	'4xl': 'max-w-4xl',
	'5xl': 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	subtitle,
	children,
	maxWidth = 'md',
	showCloseButton = true,
	className = '',
	bodyClassName = '',
	zIndex = 200,
}) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useScrollLock(isOpen);
	useKeyPress('Escape', onClose, isOpen);

	if (!isOpen || !mounted) return null;

	const modalContent = (
		<div
			style={{ zIndex }}
			className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className={`bg-white rounded-3xl w-full shadow-2xl border border-slate-100 overflow-hidden relative ${MAX_WIDTH_MAP[maxWidth]} ${className}`}
				onClick={(e) => e.stopPropagation()}
			>
				{(title || showCloseButton) && (
					<div className="flex items-start justify-between p-6 pb-3 border-b border-slate-100">
						<div>
							{title && (
								<h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
									{title}
								</h3>
							)}
							{subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
						</div>
						{showCloseButton && (
							<button
								type="button"
								onClick={onClose}
								className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-xl hover:bg-slate-100 cursor-pointer"
								aria-label="Закрыть"
							>
								<CloseIcon className="w-5 h-5" />
							</button>
						)}
					</div>
				)}

				<div className={`p-6 ${bodyClassName}`}>{children}</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};
