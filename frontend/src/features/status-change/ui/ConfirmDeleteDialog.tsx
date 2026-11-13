// frontend/src/features/status-change/ui/ConfirmDeleteDialog.tsx
import React from 'react';
import { Modal, TrashIcon } from '../../../shared/ui';

interface ConfirmDeleteDialogProps {
	isOpen: boolean;
	title: string;
	description: React.ReactNode;
	confirmText?: string;
	cancelText?: string;
	isDeleting: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
	isOpen,
	title,
	description,
	confirmText = 'Да, удалить',
	cancelText = 'Отмена',
	isDeleting,
	onConfirm,
	onCancel,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onCancel} maxWidth="md" showCloseButton={false} zIndex={220}>
			<div className="space-y-4">
				<div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
					<TrashIcon className="w-6 h-6" />
				</div>
				<div className="text-center space-y-1.5">
					<h3 className="text-lg font-black text-slate-900">{title}</h3>
					<div className="text-xs text-slate-500 leading-relaxed">{description}</div>
				</div>
				<div className="grid grid-cols-2 gap-2.5 pt-2">
					<button
						type="button"
						onClick={onCancel}
						disabled={isDeleting}
						className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isDeleting}
						className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
					>
						{isDeleting ? 'Удаление...' : confirmText}
					</button>
				</div>
			</div>
		</Modal>
	);
};
