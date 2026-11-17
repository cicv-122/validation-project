// frontend/src/widgets/dossier-viewer/ui/CandidateExamDocumentsCard.tsx
import React from 'react';
import type { StaffApplicationDocument } from '../../../api/staff';
import { OFFICIAL_EXAM_SLOTS } from '../../../entities/candidate';

interface CandidateExamDocumentsCardProps {
	documents: StaffApplicationDocument[];
	selectedDoc: StaffApplicationDocument | null;
	uploadingDocSlot: string | null;
	onSelectDoc: (doc: StaffApplicationDocument) => void;
	onViewDoc?: (doc: StaffApplicationDocument) => void;
	onDeleteDoc: (docId: number) => void;
	onSlotFileUpload: (slotType: string, files: FileList, placeholder: string) => void;
}

export const CandidateExamDocumentsCard: React.FC<CandidateExamDocumentsCardProps> = ({
	documents,
	selectedDoc,
	uploadingDocSlot,
	onSelectDoc,
	onViewDoc,
	onDeleteDoc,
	onSlotFileUpload,
}) => {
	return (
		<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
			<div className="flex items-center justify-between border-b border-slate-100 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
						4
					</div>
					<div>
						<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
							Аттестационное дело и экзаменационные акты
						</h2>
						<p className="text-[11px] text-slate-500">
							Официальные материалы экзамена, подтверждающие компетентность кандидата
						</p>
					</div>
				</div>
			</div>

			<div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
				{OFFICIAL_EXAM_SLOTS.map((slot) => {
					const attachedDocs = documents.filter((d) => {
						if (slot.type === 'photo' || slot.type === 'assessment_photo') {
							return ['photo', 'assessment_photo', 'work_sample'].includes(d.doc_type);
						}
						return d.doc_type === slot.type;
					});
					const hasDoc = attachedDocs.length > 0;
					const fileInputId = `file-input-${slot.type}`;
					const isPhotoSlot = slot.type === 'photo' || slot.type === 'assessment_photo';

					return (
						<div key={slot.type} className="p-4 hover:bg-slate-50/60 transition-colors">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold text-slate-900">{slot.title}</span>
										{hasDoc ? (
											<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
												✓ Прикреплен {isPhotoSlot ? `(${attachedDocs.length} фото)` : ''}
											</span>
										) : (
											<span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
												В архиве ЦНСВ
											</span>
										)}
									</div>
									<div className="text-[11px] text-slate-500 mt-0.5">{slot.subtitle}</div>

									{/* Мини-галерея для фотофиксации */}
									{hasDoc && isPhotoSlot ? (
										<div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
											{attachedDocs.map((doc, idx) => {
												const isSelected = selectedDoc?.id === doc.id;
												return (
													<div
														key={doc.id}
														onClick={() => {
															onSelectDoc(doc);
															onViewDoc?.(doc);
														}}
														className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
															isSelected
																? 'border-[#283375] ring-2 ring-[#283375]/20 shadow-md'
																: 'border-slate-200 hover:border-slate-400'
														}`}
														title={`Нажмите для просмотра фото #${idx + 1}`}
													>
														<img
															src={doc.file_url}
															alt={doc.description || `Фото ${idx + 1}`}
															className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
														/>
														<span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/65 text-white text-[10px] font-bold">
															#{idx + 1}
														</span>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																onDeleteDoc(doc.id);
															}}
															className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/65 hover:bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
															title="Удалить фото"
														>
															✕
														</button>
													</div>
												);
											})}
										</div>
									) : hasDoc ? (
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
															onClick={() => {
																onSelectDoc(doc);
																onViewDoc?.(doc);
															}}
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
									) : null}
								</div>

								{/* Кнопка загрузки */}
								<div className="flex-shrink-0 self-start sm:self-center">
									<input
										id={fileInputId}
										type="file"
										multiple={isPhotoSlot}
										accept={isPhotoSlot ? 'image/*' : '.pdf,.jpg,.jpeg,.png,.webp'}
										className="hidden"
										onChange={(e) => {
											const files = e.target.files;
											if (files && files.length > 0) {
												onSlotFileUpload(slot.type, files, slot.descriptionPlaceholder);
											}
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
										<span>{hasDoc ? (isPhotoSlot ? 'Добавить фото' : 'Добавить ещё') : (isPhotoSlot ? 'Загрузить фото' : 'Загрузить скан')}</span>
									</label>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
