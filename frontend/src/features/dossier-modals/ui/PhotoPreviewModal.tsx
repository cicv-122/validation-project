import React from 'react';

interface PhotoPreviewModalProps {
	isOpen: boolean;
	photoUrl: string | null;
	fullName: string;
	onClose: () => void;
	onReplaceClick: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
	isOpen,
	photoUrl,
	fullName,
	onClose,
	onReplaceClick,
}) => {
	if (!isOpen || !photoUrl) return null;

	return (
		<div
			className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				className="relative max-w-md w-full bg-slate-900 rounded-3xl p-5 shadow-2xl border border-white/10 flex flex-col items-center"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="w-full flex items-center justify-between pb-3 px-1 border-b border-white/10 mb-4">
					<div className="min-w-0 pr-3">
						<span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
							Фото кандидата 3×4
						</span>
						<h3 className="text-white font-bold text-sm truncate">
							{fullName || 'Специалист'}
						</h3>
					</div>
					<div className="flex items-center gap-2 flex-shrink-0">
						<button
							type="button"
							onClick={onReplaceClick}
							className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer"
							title="Загрузить новое фото"
						>
							Заменить
						</button>
						<button
							type="button"
							onClick={onClose}
							className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-sm"
							title="Закрыть просмотр"
						>
							✕
						</button>
					</div>
				</div>
				<div className="w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 p-2">
					<img
						src={photoUrl}
						alt={fullName || 'Фото специалиста'}
						className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg"
					/>
				</div>
			</div>
		</div>
	);
};
