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
	selectedDoc,
	onSelectDoc,
	onOpenModal,
	onDeleteDoc,
}) => {
	// Mode to allow inline scroll vs smooth page scroll (click-shield)
	const [allowInlineScroll, setAllowInlineScroll] = useState<boolean>(false);

	const isPdf = selectedDoc?.file_url?.toLowerCase().endsWith('.pdf');

	return (
		<div className="space-y-6 lg:sticky lg:top-[160px] lg:max-h-[calc(100vh-175px)] lg:overflow-y-auto lg:pr-1">
			{/* КАРТОЧКА КОНТРОЛЯ КОМПЛЕКТНОСТИ */}
			<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
				<div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
						Комплектность дела кандидата
					</h3>
					<span className="text-xs font-black text-[#283375] font-mono">
						{completenessPercent}%
					</span>
				</div>

				{/* Прогресс-бар */}
				<div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
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

				{/* Список пунктов */}
				<div className="space-y-2 text-xs">
					<div
						className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
							certScanDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
						}`}
						onClick={() => certScanDoc && onSelectDoc?.(certScanDoc)}
					>
						<span className="text-slate-600">Скан сертификата строгой отчетности:</span>
						{certScanDoc ? (
							<span className="text-emerald-700 font-bold hover:underline">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div
						className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
							examProtocolDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
						}`}
						onClick={() => examProtocolDoc && onSelectDoc?.(examProtocolDoc)}
					>
						<span className="text-slate-600">Протокол квалификационной комиссии:</span>
						{examProtocolDoc ? (
							<span className="text-emerald-700 font-bold hover:underline">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div
						className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
							evalSheetDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
						}`}
						onClick={() => evalSheetDoc && onSelectDoc?.(evalSheetDoc)}
					>
						<span className="text-slate-600">Оценочный лист квалификационного экзамена:</span>
						{evalSheetDoc ? (
							<span className="text-emerald-700 font-bold hover:underline">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div
						className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
							examTaskDoc && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
						}`}
						onClick={() => examTaskDoc && onSelectDoc?.(examTaskDoc)}
					>
						<span className="text-slate-600">Экзаменационный билет и задания:</span>
						{examTaskDoc ? (
							<span className="text-emerald-700 font-bold hover:underline">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div
						className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
							examPhotos.length > 0 && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
						}`}
						onClick={() => examPhotos.length > 0 && onSelectDoc?.(examPhotos[0])}
					>
						<span className="text-slate-600">Фотофиксация квалификационного экзамена:</span>
						{examPhotos.length > 0 ? (
							<span className="text-emerald-700 font-bold hover:underline">✓ {examPhotos.length} фото</span>
						) : (
							<span className="text-slate-400">Не загружено</span>
						)}
					</div>

					<div
						className={`flex items-center justify-between p-1.5 rounded-lg transition-colors pt-1 border-t border-slate-100 ${
							personalDocs.length > 0 && onSelectDoc ? 'cursor-pointer hover:bg-slate-50' : ''
						}`}
						onClick={() => personalDocs.length > 0 && onSelectDoc?.(personalDocs[0])}
					>
						<span className="text-slate-600">Личные документы заявителя (паспорт, диплом...):</span>
						{personalDocs.length > 0 ? (
							<span className="text-emerald-700 font-bold hover:underline">✓ {personalDocs.length} док.</span>
						) : (
							<span className="text-slate-400">Не прикреплены</span>
						)}
					</div>
				</div>
			</div>

			{/* LIVE INSPECTOR ДОКУМЕНТА */}
			<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
				{/* ШАПКА ИНСПЕКТОРА */}
				<div className="p-3.5 bg-slate-900 text-white flex items-center justify-between gap-3">
					<div className="min-w-0">
						<div className="text-[10px] uppercase font-bold text-slate-400">
							{selectedDoc ? 'Просмотр документа' : 'Инспектор материалов'}
						</div>
						<div className="text-xs font-bold truncate">
							{selectedDoc?.description || selectedDoc?.doc_type_display || 'Выберите документ для просмотра'}
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
									<span>Во весь экран</span>
								</button>
							)}

							<a
								href={selectedDoc.file_url}
								target="_blank"
								rel="noopener noreferrer"
								className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] transition-all cursor-pointer"
								title="Открыть в новой вкладке"
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

				{/* ТУЛБАР РЕЖИМА СКРОЛЛА (ДЛЯ PDF) */}
				{selectedDoc && isPdf && (
					<div className="bg-slate-800 px-3 py-1.5 text-[11px] text-slate-300 flex items-center justify-between border-b border-slate-700">
						<span className="text-slate-400">
							{allowInlineScroll ? 'Режим: скролл внутри PDF' : 'Режим: плавный скролл страницы'}
						</span>
						<button
							type="button"
							onClick={() => setAllowInlineScroll(!allowInlineScroll)}
							className="text-[10px] font-bold text-blue-300 hover:text-white underline cursor-pointer"
						>
							{allowInlineScroll ? 'Защитить скролл' : 'Разрешить скролл здесь'}
						</button>
					</div>
				)}

				{/* ОБЛАСТЬ ПРОСМОТРА */}
				<div className="relative bg-slate-950 flex items-center justify-center min-h-[380px] p-2 overflow-hidden group">
					{selectedDoc ? (
						<>
							{isPdf ? (
								<iframe
									src={selectedDoc.file_url}
									title="PDF Preview"
									className={`w-full h-[480px] rounded-lg border-0 bg-white transition-opacity ${
										allowInlineScroll ? 'pointer-events-auto' : 'pointer-events-none'
									}`}
								/>
							) : (
								<img
									src={selectedDoc.file_url}
									alt={selectedDoc.description || 'Документ'}
									className="max-w-full max-h-[480px] object-contain rounded-lg shadow-md cursor-pointer"
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
							<div className="text-xs font-semibold">Нажмите на любой документ в деле слева</div>
							<p className="text-[11px] text-slate-600 max-w-xs">
								Здесь отобразится скан оценочного листа, протокола или фото экзамена в высоком разрешении.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
