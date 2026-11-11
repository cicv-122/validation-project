// frontend/src/widgets/dossier-viewer/ui/DossierDocumentSlots.tsx
import React, { useState } from 'react';
import type { StaffApplicationDocument } from '../../../api/staff';
import { OFFICIAL_EXAM_SLOTS, PERSONAL_DOC_SLOTS } from '../../../entities/candidate';

interface DossierDocumentSlotsProps {
	documents: StaffApplicationDocument[];
	uploadingDoc: boolean;
	onUploadFiles: (docType: string, files: FileList, descriptionPlaceholder: string) => void;
	onDeleteDoc: (docId: number) => void;
}

export const DossierDocumentSlots: React.FC<DossierDocumentSlotsProps> = ({
	documents,
	uploadingDoc,
	onUploadFiles,
	onDeleteDoc,
}) => {
	const [docSubTab, setDocSubTab] = useState<'exam' | 'personal'>('exam');

	const examDocs = documents.filter((d) =>
		['exam_protocol', 'evaluation_sheet', 'exam_task', 'photo', 'assessment_photo', 'certificate_scan'].includes(
			d.doc_type
		)
	);
	const personalDocs = documents.filter((d) =>
		[
			'passport',
			'id_card',
			'application_form',
			'diploma',
			'resume',
			'contract',
			'payment_receipt',
			'portfolio',
			'other',
		].includes(d.doc_type)
	);

	const activeSlots = docSubTab === 'exam' ? OFFICIAL_EXAM_SLOTS : PERSONAL_DOC_SLOTS;

	return (
		<div className="border-t border-slate-200 pt-6 space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2">
						<svg className="w-4 h-4 text-[#283375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
							/>
						</svg>
						<span>Документы дела кандидата</span>
					</h3>
					<p className="text-[11px] text-slate-500">
						Всего прикреплено файлов: <b>{documents.length}</b>
					</p>
				</div>

				{/* Переключатель разделов: Экзамен vs Личные документы */}
				<div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
					<button
						type="button"
						onClick={() => setDocSubTab('exam')}
						className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
							docSubTab === 'exam' ? 'bg-white text-[#283375] shadow-xs' : 'text-slate-600 hover:text-slate-900'
						}`}
					>
						<span>Экзамен и оценка</span>
						<span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#283375]">
							{examDocs.length}
						</span>
					</button>
					<button
						type="button"
						onClick={() => setDocSubTab('personal')}
						className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
							docSubTab === 'personal'
								? 'bg-white text-[#283375] shadow-xs'
								: 'text-slate-600 hover:text-slate-900'
						}`}
					>
						<span>Личные документы</span>
						<span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
							{personalDocs.length}
						</span>
					</button>
				</div>
			</div>

			{/* Индикатор загрузки */}
			{uploadingDoc && (
				<div className="p-3.5 rounded-2xl bg-[#283375] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse">
					<div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
					<span>Идёт загрузка и оптимизация файла... Пожалуйста, подождите</span>
				</div>
			)}

			{/* Список слотов для документов */}
			<div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
				{activeSlots.map((slot) => {
					const attachedDocs = documents.filter((d) => {
						if (slot.type === 'photo') return d.doc_type === 'photo' || d.doc_type === 'assessment_photo';
						if (slot.type === 'passport') return d.doc_type === 'passport' || d.doc_type === 'id_card';
						return d.doc_type === slot.type;
					});
					const hasDoc = attachedDocs.length > 0;

					return (
						<div key={slot.type} className="p-4 hover:bg-slate-50/70 transition-colors">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold text-slate-900">{slot.title}</span>
										{hasDoc ? (
											<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
												✓ Прикреплен {attachedDocs.length > 1 ? `(${attachedDocs.length})` : ''}
											</span>
										) : (
											<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
												{slot.required ? 'Обязательный' : 'По регламенту'}
											</span>
										)}
									</div>
									<p className="text-[11px] text-slate-500 mt-0.5">{slot.subtitle}</p>

									{/* Прикрепленные документы */}
									{hasDoc && (
										<div className="mt-2.5 flex flex-wrap gap-2">
											{attachedDocs.map((doc) => (
												<div
													key={doc.id}
													className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-slate-800 shadow-2xs"
												>
													<a
														href={doc.file_url || doc.file}
														target="_blank"
														rel="noreferrer"
														className="font-bold text-[#283375] hover:underline truncate max-w-[220px]"
													>
														{doc.description || doc.doc_type_display || 'Открыть скан'} ↗
													</a>
													<button
														type="button"
														onClick={() => onDeleteDoc(doc.id)}
														className="text-red-500 hover:text-red-700 p-0.5 ml-1 cursor-pointer font-bold"
														title="Удалить файл"
													>
														✕
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Кнопка загрузки */}
								<label
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex-shrink-0 self-start sm:self-center ${
										hasDoc
											? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
											: 'bg-[#283375] hover:bg-[#1e265c] text-white'
									}`}
								>
									<input
										type="file"
										multiple
										accept={slot.type === 'photo' ? 'image/*' : '.pdf,.doc,.docx,image/*'}
										className="hidden"
										disabled={uploadingDoc}
										onChange={(e) => {
											if (e.target.files && e.target.files.length > 0) {
												onUploadFiles(slot.type, e.target.files, slot.descriptionPlaceholder);
												e.target.value = '';
											}
										}}
									/>
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									<span>{hasDoc ? 'Добавить ещё' : 'Загрузить скан'}</span>
								</label>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
