import React from 'react';
import type { StaffApplicationDocument } from '../../../api/staff';

interface CandidateCertificateCardProps {
	fullRegistrationNumber: string;
	certScanDoc?: StaffApplicationDocument;
	onViewDoc: (doc: StaffApplicationDocument) => void;
	onDeleteDoc: (docId: number) => void;
	onUploadSlotFile: (slotType: string, file: File, desc: string) => void;
	uploadingDocSlot: string | null;
	qrCodeUrl?: string | null;
	publicVerifyUrl: string;
	onCopyLink: () => void;
	linkCopied: boolean;
	downloadingQR: string | null;
	onDownloadQR: (format: 'svg' | 'png') => void;
}

export const CandidateCertificateCard: React.FC<CandidateCertificateCardProps> = ({
	fullRegistrationNumber,
	certScanDoc,
	onViewDoc,
	onDeleteDoc,
	onUploadSlotFile,
	uploadingDocSlot,
	qrCodeUrl,
	publicVerifyUrl,
	onCopyLink,
	linkCopied,
	downloadingQR,
	onDownloadQR,
}) => {
	return (
		<>
			{/* 3. ИТОГОВЫЙ СЕРТИФИКАТ СТРОГОЙ ОТЧЕТНОСТИ */}
			<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
				<div className="flex items-center justify-between border-b border-slate-100 pb-3">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
							3
						</div>
						<div>
							<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
								Сертификат строгой отчетности
							</h2>
							<p className="text-[11px] text-slate-500">
								Скан выданного оригинального бланка с гербовой печатью ({fullRegistrationNumber})
							</p>
						</div>
					</div>
					{certScanDoc && (
						<span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
							<span>✓</span> <span>Бланк в деле</span>
						</span>
					)}
				</div>

				{certScanDoc ? (
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
						<div className="flex items-center gap-3.5 min-w-0">
							<div className="w-12 h-12 rounded-xl bg-[#283375] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
								</svg>
							</div>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-xs font-bold text-slate-900 truncate">
										{certScanDoc.description || certScanDoc.doc_type_display || 'Скан сертификата строгой отчетности'}
									</span>
									<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
										✓ Прикреплен
									</span>
								</div>
								<div className="text-[11px] text-slate-500 mt-0.5">
									{certScanDoc.description || 'Оригинал бланка государственного образца с печатью и подписью руководства'}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2 flex-shrink-0">
							<button
								type="button"
								onClick={() => onViewDoc(certScanDoc)}
								className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#283375] font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
							>
								Просмотр
							</button>
							<input
								id="file-input-cert-replace"
								type="file"
								accept=".pdf,.jpg,.jpeg,.png,.webp"
								className="hidden"
								onChange={(e) => {
									const f = e.target.files?.[0];
									if (f) onUploadSlotFile('certificate_scan', f, 'Скан выданного сертификата строгой отчетности');
									e.target.value = '';
								}}
							/>
							<label
								htmlFor="file-input-cert-replace"
								className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
							>
								Заменить
							</label>
							<button
								type="button"
								onClick={() => onDeleteDoc(certScanDoc.id)}
								className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
								title="Удалить скан сертификата"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>
				) : (
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 text-center sm:text-left">
						<div>
							<div className="text-xs font-bold text-slate-800">
								Скан бланка строгой отчетности еще не загружен
							</div>
							<div className="text-[11px] text-slate-500 mt-0.5">
								Прикрепите цветной скан выданного бланка {fullRegistrationNumber} с гербовой печатью ЦНСВ
							</div>
						</div>
						<input
							id="file-input-cert-upload"
							type="file"
							accept=".pdf,.jpg,.jpeg,.png,.webp"
							className="hidden"
							onChange={(e) => {
								const f = e.target.files?.[0];
								if (f) onUploadSlotFile('certificate_scan', f, 'Скан выданного сертификата строгой отчетности');
								e.target.value = '';
							}}
						/>
						<label
							htmlFor="file-input-cert-upload"
							className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex-shrink-0 ${
								uploadingDocSlot === 'certificate_scan' ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#283375] hover:bg-[#1e265c]'
							}`}
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
							</svg>
							<span>{uploadingDocSlot === 'certificate_scan' ? 'Загрузка...' : 'Загрузить скан сертификата'}</span>
						</label>
					</div>
				)}
			</div>

			{/* ОФИЦИАЛЬНЫЙ QR-КОД СЕРТИФИКАТА ДЛЯ ПЕЧАТИ В CORELDRAW И WORD */}
			<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
				<div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
					<div className="flex items-center gap-2.5 min-w-0">
						<div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
							<svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
							</svg>
						</div>
						<div className="min-w-0">
							<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
								Официальный QR-код сертификата для печати
							</h2>
							<p className="text-[11px] text-slate-500">
								Векторные кривые для вставки в защищенный бланк в CorelDraw или растр высокого разрешения (300 DPI)
							</p>
						</div>
					</div>
					<span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0 self-center shadow-2xs">
						✓ Готов к печати
					</span>
				</div>

				<div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
					{qrCodeUrl ? (
						<img
							src={qrCodeUrl}
							alt="QR Code"
							className="w-36 h-36 rounded-2xl bg-white p-2.5 border border-slate-200 shadow-xs shrink-0"
						/>
					) : (
						<div className="w-36 h-36 rounded-2xl bg-white p-3 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center shrink-0">
							<svg className="w-10 h-10 text-slate-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
							</svg>
							<span className="text-[10px] text-slate-400 font-bold">QR код</span>
						</div>
					)}

					<div className="space-y-3.5 flex-1 w-full text-xs">
						<div className="space-y-1.5">
							<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
								Ссылка онлайн-верификации:
							</span>
							<div className="flex items-center gap-2 flex-wrap">
								<span className="font-mono text-xs text-[#283375] font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 select-all shadow-2xs">
									https://validation.kg{publicVerifyUrl}
								</span>
								<button
									type="button"
									onClick={onCopyLink}
									className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200/60"
									title="Скопировать ссылку верификации в буфер обмена"
								>
									{linkCopied ? (
										<>
											<svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
											</svg>
											<span className="text-emerald-700">Скопировано!</span>
										</>
									) : (
										<>
											<svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
											<span>Копировать</span>
										</>
									)}
								</button>
								<a
									href={publicVerifyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#283375] font-bold text-xs hover:bg-blue-100 border border-blue-200/80 transition-all flex items-center gap-1"
								>
									<span>Проверить онлайн ↗</span>
								</a>
							</div>
						</div>

						<p className="text-[11px] text-slate-500 leading-relaxed">
							При сканировании камерой смартфона работодатель или инспектор мгновенно переходит на официальный государственный портал ЦНСВ с подтверждением легитимности документа.
						</p>

						<div className="flex flex-wrap items-center gap-3 pt-1">
							<button
								type="button"
								disabled={!!downloadingQR}
								onClick={() => onDownloadQR('svg')}
								className="px-4 py-2.5 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
								title="Скачать векторный QR-код в формате SVG для CorelDraw (без потери качества)"
							>
								<svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								<span>Скачать SVG (Вектор для CorelDraw)</span>
							</button>
							<button
								type="button"
								disabled={!!downloadingQR}
								onClick={() => onDownloadQR('png')}
								className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all border border-slate-200 shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
								title="Скачать растровый QR-код в формате PNG (300 DPI) для Word и печати"
							>
								<svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								<span>Скачать PNG (300 DPI)</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
