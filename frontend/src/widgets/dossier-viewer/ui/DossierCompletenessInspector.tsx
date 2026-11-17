// frontend/src/widgets/dossier-viewer/ui/DossierCompletenessInspector.tsx
import React, { useState } from 'react';
import type { StaffApplicationDocument } from '../../../api/staff';

interface DossierCompletenessInspectorProps {
	completenessPercent: number;
	certScanDoc?: StaffApplicationDocument;
	examProtocolDoc?: StaffApplicationDocument;
	evalSheetDoc?: StaffApplicationDocument;
	examTaskDoc?: StaffApplicationDocument;
	examPhotos: StaffApplicationDocument[];
	personalDocs: StaffApplicationDocument[];
	allDocs?: StaffApplicationDocument[];
	selectedDoc: StaffApplicationDocument | null;
	onSelectDoc?: (doc: StaffApplicationDocument) => void;
	onOpenModal?: () => void;
	onDeleteDoc: (docId: number) => void;
}

export const DossierCompletenessInspector: React.FC<DossierCompletenessInspectorProps> = ({
	completenessPercent,
	certScanDoc,
	examProtocolDoc,
	evalSheetDoc,
	examTaskDoc,
	examPhotos,
	personalDocs,
	allDocs = [],
	selectedDoc,
	onSelectDoc,
	onOpenModal,
	onDeleteDoc,
}) => {
	// Accordion state for completeness checklist
	const [showChecklistDetails, setShowChecklistDetails] = useState<boolean>(false);
	// Mode to allow inline scroll vs smooth page scroll (click-shield)
	const [allowInlineScroll, setAllowInlineScroll] = useState<boolean>(false);

	const isPdf = selectedDoc?.file_url?.toLowerCase().endsWith('.pdf');

	return (
		<div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-96px)] lg:sticky lg:top-[80px] overflow-hidden transition-all">
			{/* 1. ГЛАВНАЯ ШАПКА: НАЗВАНИЕ ДОКУМЕНТА И ДЕЙСТВИЯ */}
			<div className="p-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 flex-shrink-0">
				<div className="min-w-0 flex items-center gap-2.5">
					<div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0 text-xs font-bold">
						{isPdf ? 'PDF' : 'IMG'}
					</div>
					<div className="min-w-0">
						<div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
							{selectedDoc ? 'Просмотр документа' : 'Инспектор материалов'}
						</div>
						<div className="text-xs font-bold truncate text-white" title={selectedDoc?.description || selectedDoc?.doc_type_display}>
							{selectedDoc?.description || selectedDoc?.doc_type_display || 'Выберите документ для просмотра'}
						</div>
					</div>
				</div>

				{selectedDoc && (
					<div className="flex items-center gap-1.5 flex-shrink-0">
						{onOpenModal && (
							<button
								type="button"
								onClick={onOpenModal}
								className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
								title="Развернуть на весь экран (масштаб, поворот)"
							>
								<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
								</svg>
								<span className="hidden sm:inline">Во весь экран</span>
							</button>
						)}

						<a
							href={selectedDoc.file_url}
							target="_blank"
							rel="noopener noreferrer"
							className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] transition-all cursor-pointer"
							title="Открыть в новой вкладке браузера"
						>
							<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a>

						<button
							type="button"
							onClick={() => onDeleteDoc(selectedDoc.id)}
							className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-all cursor-pointer"
							title="Удалить этот файл"
						>
							<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				)}
			</div>

			{/* 2. КОМПАКТНАЯ ПЛАШКА КОМПЛЕКТНОСТИ С АККОРДЕОНОМ */}
			<div className="border-b border-slate-200 bg-slate-50/90 flex-shrink-0 transition-all">
				<div
					onClick={() => setShowChecklistDetails((prev) => !prev)}
					className="px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
					title="Нажмите, чтобы развернуть или скрыть чек-лист комплектности"
				>
					<div className="flex items-center gap-2.5 min-w-0">
						<span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 whitespace-nowrap">
							Комплектность:
						</span>
						<div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden flex-shrink-0">
							<div
								className={`h-full transition-all duration-500 ${
									completenessPercent === 100
										? 'bg-emerald-500'
										: completenessPercent >= 50
										? 'bg-blue-600'
										: 'bg-amber-500'
								}`}
								style={{ width: `${completenessPercent}%` }}
							/>
						</div>
						<span className="text-xs font-mono font-bold text-[#283375]">
							{completenessPercent}%
						</span>
					</div>

					<div className="flex items-center gap-1.5 text-xs text-slate-500">
						<span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
							{showChecklistDetails ? 'Скрыть список' : 'Чек-лист документов'}
						</span>
						<svg
							className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
								showChecklistDetails ? 'rotate-180' : ''
							}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</div>

				{/* Развернутый список чек-листа */}
				{showChecklistDetails && (
					<div className="p-3.5 pt-1 space-y-1.5 text-xs border-t border-slate-200/70 bg-white animate-in slide-in-from-top-2 duration-150 max-h-48 overflow-y-auto">
						<div
							className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
								certScanDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
							}`}
							onClick={() => certScanDoc && onSelectDoc?.(certScanDoc)}
						>
							<span className="text-slate-600 truncate pr-2">Скан бланка строгой отчетности:</span>
							{certScanDoc ? (
								<span className="text-emerald-700 font-bold hover:underline flex-shrink-0">✓ В деле</span>
							) : (
								<span className="text-slate-400 flex-shrink-0">В архиве ЦНСВ</span>
							)}
						</div>

						<div
							className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
								examProtocolDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
							}`}
							onClick={() => examProtocolDoc && onSelectDoc?.(examProtocolDoc)}
						>
							<span className="text-slate-600 truncate pr-2">Протокол квалификационной комиссии:</span>
							{examProtocolDoc ? (
								<span className="text-emerald-700 font-bold hover:underline flex-shrink-0">✓ В деле</span>
							) : (
								<span className="text-slate-400 flex-shrink-0">В архиве ЦНСВ</span>
							)}
						</div>

						<div
							className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
								evalSheetDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
							}`}
							onClick={() => evalSheetDoc && onSelectDoc?.(evalSheetDoc)}
						>
							<span className="text-slate-600 truncate pr-2">Оценочный лист квалификационного экзамена:</span>
							{evalSheetDoc ? (
								<span className="text-emerald-700 font-bold hover:underline flex-shrink-0">✓ В деле</span>
							) : (
								<span className="text-slate-400 flex-shrink-0">В архиве ЦНСВ</span>
							)}
						</div>

						<div
							className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
								examTaskDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
							}`}
							onClick={() => examTaskDoc && onSelectDoc?.(examTaskDoc)}
						>
							<span className="text-slate-600 truncate pr-2">Экзаменационный билет и задания:</span>
							{examTaskDoc ? (
								<span className="text-emerald-700 font-bold hover:underline flex-shrink-0">✓ В деле</span>
							) : (
								<span className="text-slate-400 flex-shrink-0">В архиве ЦНСВ</span>
							)}
						</div>

						<div
							className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
								examPhotos.length > 0 && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
							}`}
							onClick={() => examPhotos.length > 0 && onSelectDoc?.(examPhotos[0])}
						>
							<span className="text-slate-600 truncate pr-2">Фотофиксация квалификационного экзамена:</span>
							{examPhotos.length > 0 ? (
								<span className="text-emerald-700 font-bold hover:underline flex-shrink-0">✓ {examPhotos.length} фото</span>
							) : (
								<span className="text-slate-400 flex-shrink-0">Не загружено</span>
							)}
						</div>

						<div
							className={`flex items-center justify-between p-1.5 rounded-lg transition-colors pt-1 border-t border-slate-100 ${
								personalDocs.length > 0 && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
							}`}
							onClick={() => personalDocs.length > 0 && onSelectDoc?.(personalDocs[0])}
						>
							<span className="text-slate-600 truncate pr-2">Личные документы заявителя:</span>
							{personalDocs.length > 0 ? (
								<span className="text-emerald-700 font-bold hover:underline flex-shrink-0">✓ {personalDocs.length} док.</span>
							) : (
								<span className="text-slate-400 flex-shrink-0">Не прикреплены</span>
							)}
						</div>
					</div>
				)}
			</div>

			{/* 3. ТУЛБАР РЕЖИМА СКРОЛЛА (ДЛЯ PDF) */}
			{selectedDoc && isPdf && (
				<div className="bg-slate-800 px-3 py-1.5 text-[11px] text-slate-300 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
					<span className="text-slate-400 truncate">
						{allowInlineScroll ? 'Скролл активен внутри PDF' : 'Кликните на скан для открытия на весь экран'}
					</span>
					<button
						type="button"
						onClick={() => setAllowInlineScroll(!allowInlineScroll)}
						className="text-[10px] font-bold text-blue-300 hover:text-white underline cursor-pointer flex-shrink-0 ml-2"
					>
						{allowInlineScroll ? 'Защитить скролл' : 'Скроллить здесь'}
					</button>
				</div>
			)}

			{/* 4. ОСНОВНАЯ ОБЛАСТЬ ПРОСМОТРА НА ВСЮ ОСТАВШУЮСЯ ВЫСОТУ */}
			<div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-hidden group min-h-0">
				{selectedDoc ? (
					<>
						{isPdf ? (
							<iframe
								src={selectedDoc.file_url}
								title="PDF Preview"
								className={`w-full h-full rounded-lg border-0 bg-white transition-opacity ${
									allowInlineScroll ? 'pointer-events-auto' : 'pointer-events-none'
								}`}
							/>
						) : (
							<img
								src={selectedDoc.file_url}
								alt={selectedDoc.description || 'Документ'}
								className="max-w-full max-h-full object-contain rounded-lg shadow-md cursor-pointer"
								onClick={onOpenModal}
							/>
						)}

						{/* КЛИК-ЩИТ ДЛЯ ПЛАВНОГО СКРОЛЛА СТРАНИЦЫ */}
						{!allowInlineScroll && (
							<div
								onClick={onOpenModal}
								className="absolute inset-0 bg-transparent hover:bg-slate-900/40 cursor-pointer transition-colors flex items-center justify-center group"
								title="Нажмите для открытия документа на весь экран"
							>
								<div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 transform group-hover:scale-105 duration-200">
									<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
									</svg>
									<span>Открыть во весь экран</span>
								</div>
							</div>
						)}
					</>
				) : (
					<div className="text-center p-8 text-slate-500 space-y-2">
						<svg className="w-12 h-12 mx-auto text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<div className="text-xs font-semibold text-slate-400">Нажмите на любой документ в деле слева</div>
						<p className="text-[11px] text-slate-600 max-w-xs">
							Здесь отобразится скан протокола, оценочного листа или сертификата на всю высоту экрана.
						</p>
					</div>
				)}
			</div>

			{/* 5. НИЖНЯЯ ПАНЕЛЬ ПЕРЕКЛЮЧЕНИЯ ДОКУМЕНТОВ ДЕЛА */}
			{allDocs.length > 1 && (
				<div className="bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
					{allDocs.map((doc, idx) => {
						const isSelected = selectedDoc?.id === doc.id;
						const isDocPdf = doc.file_url.toLowerCase().endsWith('.pdf');
						return (
							<button
								key={doc.id}
								type="button"
								onClick={() => onSelectDoc?.(doc)}
								className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
									isSelected
										? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400'
										: 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
								}`}
								title={doc.description || doc.doc_type_display}
							>
								<span>{isDocPdf ? '📄' : '🖼'}</span>
								<span className="truncate max-w-[120px]">
									{doc.description || doc.doc_type_display || `Документ ${idx + 1}`}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
