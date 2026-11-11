// frontend/src/widgets/dossier-viewer/ui/CandidatePersonalDocumentsCard.tsx
import React from 'react';
import type { StaffApplicationDocument } from '../../../api/staff';
import { PERSONAL_DOC_SLOTS } from '../../../entities/candidate';

interface CandidatePersonalDocumentsCardProps {
	documents: StaffApplicationDocument[];
	personalDocs: StaffApplicationDocument[];
	selectedDoc: StaffApplicationDocument | null;
	uploadingDocSlot: string | null;
	onSelectDoc: (doc: StaffApplicationDocument) => void;
	onDeleteDoc: (docId: number) => void;
	onSlotFileChange: (slotType: string, file: File, placeholder: string) => void;
	onOpenAddModal: () => void;
}

export const CandidatePersonalDocumentsCard: React.FC<CandidatePersonalDocumentsCardProps> = ({
	documents,
	personalDocs,
	selectedDoc,
	uploadingDocSlot,
	onSelectDoc,
	onDeleteDoc,
	onSlotFileChange,
	onOpenAddModal,
}) => {
	const otherDocs = personalDocs.filter(
		(d) => !PERSONAL_DOC_SLOTS.some((s) => s.type === d.doc_type)
	);

	return (
		<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
						5
					</div>
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
								Личные документы заявителя
							</h2>
							<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
								Архив ЦНСВ (ДСП)
							</span>
						</div>
						<p className="text-[11px] text-slate-500">
							Входной пакет документов заявителя: паспорт, заявление, диплом, договор и оплата (не выводятся в QR-код)
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={onOpenAddModal}
					className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
				>
					<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					<span>Иной документ</span>
				</button>
			</div>

			{/* СЛОТЫ ЛИЧНЫХ ДОКУМЕНТОВ */}
			<div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
				{PERSONAL_DOC_SLOTS.map((slot) => {
					const attachedDocs = documents.filter((d) => d.doc_type === slot.type);
					const hasDoc = attachedDocs.length > 0;
					const fileInputId = `file-input-personal-${slot.type}`;

					return (
						<div key={slot.type} className="p-4 hover:bg-slate-50/60 transition-colors">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold text-slate-900">{slot.title}</span>
										{hasDoc ? (
											<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
												✓ Прикреплен {attachedDocs.length > 1 ? `(${attachedDocs.length})` : ''}
											</span>
										) : (
											<span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
												В архиве ЦНСВ
											</span>
										)}
									</div>
									<div className="text-[11px] text-slate-500 mt-0.5">{slot.subtitle}</div>

									{/* Список прикрепленных документов данного типа */}
									{hasDoc && (
										<div className="mt-2.5 space-y-1.5">
											{attachedDocs.map((doc) => (
												<div
													key={doc.id}
													className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
														selectedDoc?.id === doc.id
															? 'bg-blue-50/80 border-[#283375] text-[#283375] font-semibold'
															: 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
													}`}
													onClick={() => onSelectDoc(doc)}
												>
													<div className="flex items-center gap-2 truncate pr-2">
														<svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
														</svg>
														<span className="truncate">{doc.description || doc.doc_type_display}</span>
													</div>

													<div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
														<button
															type="button"
															onClick={() => onSelectDoc(doc)}
															className="px-2.5 py-1 text-[11px] font-bold text-[#283375] hover:bg-white rounded-lg transition-colors cursor-pointer"
														>
															Просмотр
														</button>
														<button
															type="button"
															onClick={() => onDeleteDoc(doc.id)}
															className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
															title="Удалить документ"
														>
															<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
															</svg>
														</button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Кнопка загрузки */}
								<div className="flex-shrink-0 self-start sm:self-center">
									<input
										id={fileInputId}
										type="file"
										accept=".pdf,.jpg,.jpeg,.png,.webp"
										className="hidden"
										onChange={(e) => {
											const f = e.target.files?.[0];
											if (f) onSlotFileChange(slot.type, f, slot.descriptionPlaceholder);
											e.target.value = '';
										}}
									/>
									<label
										htmlFor={fileInputId}
										className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
											uploadingDocSlot === slot.type
												? 'bg-slate-200 text-slate-500 cursor-not-allowed'
												: hasDoc
												? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
												: 'bg-[#283375] hover:bg-[#1e265c] text-white'
										}`}
									>
										<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
										<span>{hasDoc ? 'Добавить ещё' : 'Загрузить скан'}</span>
									</label>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* ДОПОЛНИТЕЛЬНЫЕ ИНЫЕ ДОКУМЕНТЫ */}
			{otherDocs.length > 0 && (
				<div className="pt-3 border-t border-slate-100 space-y-2">
					<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
						Дополнительные прикрепленные документы ({otherDocs.length})
					</span>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
						{otherDocs.map((doc) => (
							<div
								key={doc.id}
								onClick={() => onSelectDoc(doc)}
								className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
									selectedDoc?.id === doc.id
										? 'bg-blue-50/80 border-[#283375] text-[#283375] font-semibold'
										: 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
								}`}
							>
								<div className="truncate">
									<div className="font-bold truncate">{doc.doc_type_display}</div>
									<div className="text-[10px] text-slate-400 truncate">{doc.description || 'Документ дела'}</div>
								</div>

								<div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
									<button
										type="button"
										onClick={() => onSelectDoc(doc)}
										className="px-2 py-1 text-[11px] font-bold text-[#283375] hover:bg-white rounded-lg transition-colors cursor-pointer"
									>
										Просмотр
									</button>
									<button
										type="button"
										onClick={() => onDeleteDoc(doc.id)}
										className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
										title="Удалить"
									>
										<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
