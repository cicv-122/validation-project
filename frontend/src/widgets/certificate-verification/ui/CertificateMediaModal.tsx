import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export interface CertificateMediaPreview {
	url: string;
	title: string;
	isPdf?: boolean;
	photos?: Array<{ id?: number; file_url: string; description?: string }>;
	currentIndex?: number;
}

interface CertificateMediaModalProps {
	previewModal: CertificateMediaPreview | null;
	onClose: () => void;
	onSelectPhoto?: (index: number) => void;
}

export function CertificateMediaModal({
	previewModal,
	onClose,
	onSelectPhoto,
}: CertificateMediaModalProps) {
	const { t } = useTranslation();

	useEffect(() => {
		if (!previewModal) {
			document.body.style.overflow = '';
			return;
		}
		document.body.style.overflow = 'hidden';
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			} else if (previewModal.photos && previewModal.photos.length > 1 && onSelectPhoto) {
				const total = previewModal.photos.length;
				const cur = previewModal.currentIndex ?? 0;
				if (e.key === 'ArrowRight') {
					const next = (cur + 1) % total;
					onSelectPhoto(next);
				} else if (e.key === 'ArrowLeft') {
					const prevIdx = (cur - 1 + total) % total;
					onSelectPhoto(prevIdx);
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [previewModal, onClose, onSelectPhoto]);

	if (!previewModal) return null;

	return createPortal(
		<div
			style={{ zIndex: 999999 }}
			className='fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:hidden'
			onClick={onClose}
		>
			<div
				className='relative bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-white/10'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className='p-4 bg-slate-900 text-white flex items-center justify-between gap-3 flex-shrink-0 border-b border-white/10'>
					<span className='text-xs sm:text-sm font-bold truncate'>
						{previewModal.title}
					</span>
					<div className='flex items-center gap-2 flex-shrink-0'>
						<a
							href={previewModal.url}
							target='_blank'
							rel='noreferrer'
							className='px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold transition-all whitespace-nowrap'
						>
							{t('Открыть оригинал')} ↗
						</a>
						<button
							type='button'
							onClick={onClose}
							className='w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center font-bold text-sm transition-all cursor-pointer'
							title={t('Закрыть')}
						>
							✕
						</button>
					</div>
				</div>

				{/* Content */}
				<div className='relative flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-3 min-h-[350px] select-none'>
					{/* Кнопки переключения фото (если в галерее больше 1 фото) */}
					{previewModal.photos && previewModal.photos.length > 1 && onSelectPhoto && (
						<>
							<button
								type='button'
								onClick={() => {
									const total = previewModal.photos!.length;
									const cur = previewModal.currentIndex ?? 0;
									const prevIdx = (cur - 1 + total) % total;
									onSelectPhoto(prevIdx);
								}}
								className='absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center text-2xl font-bold shadow-lg transition-all cursor-pointer'
								title={t('Предыдущее фото')}
							>
								‹
							</button>
							<button
								type='button'
								onClick={() => {
									const total = previewModal.photos!.length;
									const cur = previewModal.currentIndex ?? 0;
									const nextIdx = (cur + 1) % total;
									onSelectPhoto(nextIdx);
								}}
								className='absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center text-2xl font-bold shadow-lg transition-all cursor-pointer'
								title={t('Следующее фото')}
							>
								›
							</button>
						</>
					)}

					{previewModal.isPdf ? (
						<iframe
							src={previewModal.url}
							title={previewModal.title}
							className='w-full h-[75vh] border-0 rounded-lg bg-white'
						/>
					) : (
						<img
							src={previewModal.url}
							alt={previewModal.title}
							className='max-w-full max-h-[72vh] object-contain rounded-lg shadow-lg'
						/>
					)}
				</div>

				{/* Нижняя лента миниатюр, если фотографий несколько */}
				{previewModal.photos && previewModal.photos.length > 1 && onSelectPhoto && (
					<div className='p-3 bg-slate-900 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto flex-shrink-0'>
						{previewModal.photos.map((photo, idx) => {
							const isActive = (previewModal.currentIndex ?? 0) === idx;
							return (
								<button
									key={idx}
									type='button'
									onClick={() => onSelectPhoto(idx)}
									className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
										isActive
											? 'border-amber-400 scale-105 shadow-md'
											: 'border-white/20 opacity-60 hover:opacity-100'
									}`}
								>
									<img
										src={photo.file_url}
										alt={`Фото ${idx + 1}`}
										className='w-full h-full object-cover'
									/>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>,
		document.body
	);
}
