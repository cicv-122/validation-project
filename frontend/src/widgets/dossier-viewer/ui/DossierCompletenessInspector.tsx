// frontend/src/widgets/dossier-viewer/ui/DossierCompletenessInspector.tsx
import React from 'react';
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
	onDeleteDoc,
}) => {
	return (
		<div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
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
					<div className="flex items-center justify-between">
						<span className="text-slate-600">Скан сертификата строгой отчетности:</span>
						{certScanDoc ? (
							<span className="text-emerald-700 font-bold">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div className="flex items-center justify-between">
						<span className="text-slate-600">Протокол квалификационной комиссии:</span>
						{examProtocolDoc ? (
							<span className="text-emerald-700 font-bold">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div className="flex items-center justify-between">
						<span className="text-slate-600">Оценочный лист квалификационного экзамена:</span>
						{evalSheetDoc ? (
							<span className="text-emerald-700 font-bold">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div className="flex items-center justify-between">
						<span className="text-slate-600">Экзаменационный билет и задания:</span>
						{examTaskDoc ? (
							<span className="text-emerald-700 font-bold">✓ В деле</span>
						) : (
							<span className="text-slate-400">В архиве ЦНСВ</span>
						)}
					</div>

					<div className="flex items-center justify-between">
						<span className="text-slate-600">Фотофиксация квалификационного экзамена:</span>
						{examPhotos.length > 0 ? (
							<span className="text-emerald-700 font-bold">✓ {examPhotos.length} фото</span>
						) : (
							<span className="text-slate-400">Не загружено</span>
						)}
					</div>

					<div className="flex items-center justify-between pt-1 border-t border-slate-100">
						<span className="text-slate-600">Личные документы заявителя (паспорт, диплом...):</span>
						{personalDocs.length > 0 ? (
							<span className="text-emerald-700 font-bold">✓ {personalDocs.length} док.</span>
						) : (
							<span className="text-slate-400">Не прикреплены</span>
						)}
					</div>
				</div>
			</div>

			{/* LIVE INSPECTOR ДОКУМЕНТА */}
			<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col min-h-[460px]">
				<div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3">
					<div className="min-w-0">
						<div className="text-[10px] uppercase font-bold text-slate-400">
							{selectedDoc ? 'Просмотр документа' : 'Инспектор материалов'}
						</div>
						<div className="text-xs font-bold truncate">
							{selectedDoc?.description || selectedDoc?.doc_type_display || 'Выберите документ для просмотра'}
						</div>
					</div>

					{selectedDoc && (
						<div className="flex items-center gap-2 flex-shrink-0">
							<a
								href={selectedDoc.file_url}
								target="_blank"
								rel="noopener noreferrer"
								className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all cursor-pointer"
							>
								В полный экран ↗
							</a>
							<button
								type="button"
								onClick={() => onDeleteDoc(selectedDoc.id)}
								className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-all cursor-pointer"
								title="Удалить этот файл"
							>
								<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					)}
				</div>

				<div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[380px] p-2">
					{selectedDoc ? (
						selectedDoc.file_url.toLowerCase().endsWith('.pdf') ? (
							<iframe
								src={selectedDoc.file_url}
								title="PDF Preview"
								className="w-full h-[520px] rounded-lg border-0 bg-white"
							/>
						) : (
							<img
								src={selectedDoc.file_url}
								alt={selectedDoc.description || 'Документ'}
								className="max-w-full max-h-[520px] object-contain rounded-lg shadow-md"
							/>
						)
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
