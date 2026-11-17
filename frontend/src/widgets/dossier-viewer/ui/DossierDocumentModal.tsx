// frontend/src/widgets/dossier-viewer/ui/DossierDocumentModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { StaffApplicationDocument } from '../../../api/staff';

interface DossierDocumentModalProps {
	isOpen: boolean;
	onClose: () => void;
	documents: StaffApplicationDocument[];
	activeDoc: StaffApplicationDocument | null;
	onSelectDoc: (doc: StaffApplicationDocument) => void;
	onDeleteDoc?: (docId: number) => void;
}

export const DossierDocumentModal: React.FC<DossierDocumentModalProps> = ({
	isOpen,
	onClose,
	documents,
	activeDoc,
	onSelectDoc,
	onDeleteDoc,
}) => {
	const [zoom, setZoom] = useState<number>(100);
	const [rotation, setRotation] = useState<number>(0);

	// Reset zoom and rotation when active document changes
	useEffect(() => {
		setZoom(100);
		setRotation(0);
	}, [activeDoc?.id]);

	// Current document index and navigation
	const currentIndex = documents.findIndex((d) => d.id === activeDoc?.id);
	const hasPrev = currentIndex > 0;
	const hasNext = currentIndex >= 0 && currentIndex < documents.length - 1;

	const handlePrev = useCallback(() => {
		if (hasPrev) {
			onSelectDoc(documents[currentIndex - 1]);
		}
	}, [hasPrev, currentIndex, documents, onSelectDoc]);

	const handleNext = useCallback(() => {
		if (hasNext) {
			onSelectDoc(documents[currentIndex + 1]);
		}
	}, [hasNext, currentIndex, documents, onSelectDoc]);

	const handleRotate = () => {
		setRotation((prev) => (prev + 90) % 360);
	};

	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev + 25, 250));
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev - 25, 50));
	};

	const handleResetZoom = () => {
		setZoom(100);
		setRotation(0);
	};

	// Keyboard shortcuts: Esc, ArrowLeft, ArrowRight, +, -
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			} else if (e.key === 'ArrowLeft') {
				handlePrev();
			} else if (e.key === 'ArrowRight') {
				handleNext();
			} else if (e.key === '+' || e.key === '=') {
				handleZoomIn();
			} else if (e.key === '-') {
				handleZoomOut();
			} else if (e.key.toLowerCase() === 'r') {
				handleRotate();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose, handlePrev, handleNext]);

	// Prevent background scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	if (!isOpen || !activeDoc) return null;

	const isPdf = activeDoc.file_url.toLowerCase().endsWith('.pdf');

	return (
		<div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
			{/* ВЕРХНЯЯ ПАНЕЛЬ УПРАВЛЕНИЯ */}
			<div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4 text-white shadow-lg">
				{/* Название документа и навигация */}
				<div className="flex items-center gap-3 min-w-0">
					<div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
						{isPdf ? (
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
							</svg>
						) : (
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						)}
					</div>

					<div className="min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
								{activeDoc.doc_type_display || 'Документ дела'}
							</span>
							{documents.length > 1 && (
								<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
									{currentIndex + 1} из {documents.length}
								</span>
							)}
						</div>
						<h2 className="text-sm font-bold truncate text-white">
							{activeDoc.description || activeDoc.doc_type_display}
						</h2>
					</div>
				</div>

				{/* Центральные кнопки: Масштаб, Поворот, Навигация */}
				<div className="hidden md:flex items-center gap-2">
					{/* Переключение между документами */}
					{documents.length > 1 && (
						<div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
							<button
								type="button"
								onClick={handlePrev}
								disabled={!hasPrev}
								className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
									hasPrev ? 'hover:bg-slate-700 text-white cursor-pointer' : 'text-slate-600 cursor-not-allowed'
								}`}
								title="Предыдущий документ (←)"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<span className="px-2 text-xs font-mono text-slate-300">
								{currentIndex + 1} / {documents.length}
							</span>
							<button
								type="button"
								onClick={handleNext}
								disabled={!hasNext}
								className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
									hasNext ? 'hover:bg-slate-700 text-white cursor-pointer' : 'text-slate-600 cursor-not-allowed'
								}`}
								title="Следующий документ (→)"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					)}

					{/* Поворот */}
					<button
						type="button"
						onClick={handleRotate}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all cursor-pointer"
						title="Повернуть на 90 градусов (R)"
					>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<span>{rotation ? `${rotation}°` : 'Повернуть'}</span>
					</button>

					{/* Масштаб */}
					<div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
						<button
							type="button"
							onClick={handleZoomOut}
							disabled={zoom <= 50}
							className="p-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-all cursor-pointer"
							title="Уменьшить (-)"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
							</svg>
						</button>
						<button
							type="button"
							onClick={handleResetZoom}
							className="px-2 text-xs font-mono font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
							title="Сбросить масштаб (100%)"
						>
							{zoom}%
						</button>
						<button
							type="button"
							onClick={handleZoomIn}
							disabled={zoom >= 250}
							className="p-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-all cursor-pointer"
							title="Увеличить (+)"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
						</button>
					</div>
				</div>

				{/* Правые действия: В новой вкладке, Скачать, Удалить, Закрыть */}
				<div className="flex items-center gap-2">
					<a
						href={activeDoc.file_url}
						target="_blank"
						rel="noopener noreferrer"
						className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all cursor-pointer"
						title="Открыть в новой вкладке"
					>
						<span>В новой вкладке</span>
						<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>

					<a
						href={activeDoc.file_url}
						download
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
						title="Скачать файл"
					>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span className="hidden sm:inline">Скачать</span>
					</a>

					{onDeleteDoc && (
						<button
							type="button"
							onClick={() => {
								if (window.confirm('Вы уверены, что хотите удалить этот документ из дела?')) {
									onDeleteDoc(activeDoc.id);
									onClose();
								}
							}}
							className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-all cursor-pointer"
							title="Удалить документ"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					)}

					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer ml-1"
						title="Закрыть (Esc)"
					>
						<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			{/* ОБЛАСТЬ ПРОСМОТРА */}
			<div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center relative">
				{/* Мобильные кнопки навигации (плавающие по бокам) */}
				{documents.length > 1 && (
					<>
						<button
							type="button"
							onClick={handlePrev}
							disabled={!hasPrev}
							className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white shadow-xl transition-all ${
								hasPrev ? 'hover:bg-slate-800 opacity-90 hover:opacity-100 cursor-pointer' : 'opacity-20 cursor-not-allowed'
							}`}
							title="Предыдущий документ"
						>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						<button
							type="button"
							onClick={handleNext}
							disabled={!hasNext}
							className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white shadow-xl transition-all ${
								hasNext ? 'hover:bg-slate-800 opacity-90 hover:opacity-100 cursor-pointer' : 'opacity-20 cursor-not-allowed'
							}`}
							title="Следующий документ"
						>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</>
				)}

				{/* Сам документ */}
				<div
					className="transition-transform duration-200 ease-out origin-center flex items-center justify-center max-w-full max-h-full"
					style={{
						transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
					}}
				>
					{isPdf ? (
						<iframe
							src={activeDoc.file_url}
							title="PDF Document Viewer"
							className="w-[90vw] md:w-[80vw] lg:w-[1100px] h-[78vh] rounded-xl shadow-2xl bg-white border border-slate-800"
						/>
					) : (
						<img
							src={activeDoc.file_url}
							alt={activeDoc.description || 'Документ'}
							className="max-w-[90vw] max-h-[78vh] object-contain rounded-xl shadow-2xl select-none"
						/>
					)}
				</div>
			</div>

			{/* НИЖНЯЯ ПАНЕЛЬ: СПИСОК ВСЕХ ДОКУМЕНТОВ ДЕЛА */}
			{documents.length > 1 && (
				<div className="flex-shrink-0 bg-slate-900/90 border-t border-slate-800 px-4 py-2.5 overflow-x-auto flex items-center gap-2">
					<span className="text-[10px] font-extrabold uppercase text-slate-400 mr-2 flex-shrink-0">
						Документы дела:
					</span>
					{documents.map((doc, idx) => {
						const isSelected = doc.id === activeDoc.id;
						const isDocPdf = doc.file_url.toLowerCase().endsWith('.pdf');
						return (
							<button
								key={doc.id}
								type="button"
								onClick={() => onSelectDoc(doc)}
								className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
									isSelected
										? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 ring-2 ring-blue-400/40'
										: 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
								}`}
							>
								<span>{isDocPdf ? '📄' : '🖼'}</span>
								<span className="truncate max-w-[180px]">
									{doc.description || doc.doc_type_display || `Файл ${idx + 1}`}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
