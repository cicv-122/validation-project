import React from 'react';

interface DeleteDossierModalProps {
	isOpen: boolean;
	onClose: () => void;
	fullName: string;
	registrationNumber: string;
	onConfirm: () => void;
	deleting: boolean;
}

export const DeleteDossierModal: React.FC<DeleteDossierModalProps> = ({
	isOpen,
	onClose,
	fullName,
	registrationNumber,
	onConfirm,
	deleting,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
				<div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
					<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</div>
				<div className="text-center space-y-1.5">
					<h3 className="text-lg font-black text-slate-900">
						Удалить дело специалиста?
					</h3>
					<p className="text-xs text-slate-500 leading-relaxed">
						Вы действительно хотите удалить дело специалиста <b>«{fullName}»</b> (№ {registrationNumber})? Запись будет безвозвратно удалена из государственного реестра.
					</p>
				</div>
				<div className="grid grid-cols-2 gap-2.5 pt-2">
					<button
						type="button"
						onClick={onClose}
						disabled={deleting}
						className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
					>
						Отмена
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={deleting}
						className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
					>
						{deleting ? 'Удаление...' : 'Да, удалить'}
					</button>
				</div>
			</div>
		</div>
	);
};
