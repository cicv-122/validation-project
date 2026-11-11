import React from 'react';
import {
	CitizenshipCode,
	CITIZENSHIP_OPTIONS,
	PinAnalysisResult,
} from '../../../entities/candidate';

interface CandidatePersonalCardProps {
	candidateId: number | string;
	fullName: string;
	onFullNameChange: (val: string) => void;
	photoPreview: string | null;
	onPhotoClick: () => void;
	photoInputRef: React.RefObject<HTMLInputElement>;
	onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemovePhoto: () => void;
	citizenship: CitizenshipCode;
	onCitizenshipChange: (val: CitizenshipCode) => void;
	inn: string;
	onInnChange: (val: string) => void;
	pinAnalysis: PinAnalysisResult;
	currentCitizenshipMeta?: { placeholder?: string; maxLength?: number };
	certNumberDigits: string;
	onCertNumberDigitsChange: (val: string) => void;
	issuedDate: string;
	onIssuedDateChange: (val: string) => void;
	profession: string;
	onProfessionChange: (val: string) => void;
	phone: string;
	onPhoneChange: (val: string) => void;
	whatsapp: string;
	onWhatsappChange: (val: string) => void;
}

export const CandidatePersonalCard: React.FC<CandidatePersonalCardProps> = ({
	candidateId,
	fullName,
	onFullNameChange,
	photoPreview,
	onPhotoClick,
	photoInputRef,
	onPhotoChange,
	onRemovePhoto,
	citizenship,
	onCitizenshipChange,
	inn,
	onInnChange,
	pinAnalysis,
	currentCitizenshipMeta,
	certNumberDigits,
	onCertNumberDigitsChange,
	issuedDate,
	onIssuedDateChange,
	profession,
	onProfessionChange,
	phone,
	onPhoneChange,
	whatsapp,
	onWhatsappChange,
}) => {
	return (
		<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
			<div className="flex items-center justify-between border-b border-slate-100 pb-3">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
						1
					</div>
					<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
						Личные и регистрационные реквизиты
					</h2>
				</div>
				<span className="text-[11px] font-mono font-bold text-slate-400">ID: {candidateId}</span>
			</div>

			<div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
				{/* Фото 3×4 */}
				<div className="flex flex-col items-center gap-2 flex-shrink-0">
					<div
						onClick={onPhotoClick}
						className="w-28 h-36 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden relative shadow-inner group cursor-pointer transition-all hover:border-[#283375]/40 hover:shadow-md"
						title={photoPreview ? 'Нажмите для просмотра фото в полном размере' : 'Нажмите для загрузки фото'}
					>
						{photoPreview ? (
							<>
								<img
									src={photoPreview}
									alt={fullName}
									className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-slate-900/40 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
									<svg className="w-6 h-6 mb-1 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
									</svg>
									<span>Просмотр</span>
								</div>
							</>
						) : (
							<div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center group-hover:text-[#283375] group-hover:bg-slate-200/50 transition-all">
								<svg className="w-10 h-10 mb-1 opacity-40 group-hover:opacity-80 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
								</svg>
								<span className="text-[10px] font-bold">+ Добавить фото</span>
							</div>
						)}
					</div>

					<input
						ref={photoInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={onPhotoChange}
					/>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => photoInputRef.current?.click()}
							className="text-[11px] font-bold text-[#283375] hover:underline cursor-pointer"
						>
							{photoPreview ? 'Изменить фото' : 'Загрузить фото 3×4'}
						</button>

						{photoPreview && (
							<>
								<span className="text-slate-300">•</span>
								<button
									type="button"
									onClick={onRemovePhoto}
									className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
									title="Удалить фотографию из дела кандидата"
								>
									Удалить
								</button>
							</>
						)}
					</div>
				</div>

				{/* Поля ввода реквизитов */}
				<div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
					<div className="sm:col-span-2">
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							ФИО специалиста
						</label>
						<input
							type="text"
							required
							value={fullName}
							onChange={(e) => onFullNameChange(e.target.value)}
							placeholder="Фамилия Имя Отчество"
							className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-bold text-slate-900 text-sm"
						/>
					</div>

					<div>
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Гражданство
						</label>
						<select
							value={citizenship}
							onChange={(e) => onCitizenshipChange(e.target.value as CitizenshipCode)}
							className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold text-xs bg-white transition-colors cursor-pointer ${
								inn && !citizenship
									? 'border-red-400 bg-red-50/40 text-red-700'
									: 'border-slate-200 focus:border-[#283375] text-slate-900'
							}`}
						>
							<option value="">— Выберите гражданство —</option>
							{CITIZENSHIP_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							ПИН / ИНН
						</label>
						<input
							type="text"
							maxLength={currentCitizenshipMeta?.maxLength || 14}
							value={inn}
							onChange={(e) => onInnChange(e.target.value.replace(/[^0-9]/g, ''))}
							placeholder={currentCitizenshipMeta?.placeholder || 'Сначала выберите гражданство'}
							className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono font-bold text-slate-900 transition-colors ${
								inn && pinAnalysis.errorMessage
									? 'border-red-400 bg-red-50/40 focus:border-red-600'
									: inn && pinAnalysis.isValid && pinAnalysis.isComplete
									? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
									: 'border-slate-200 focus:border-[#283375]'
							}`}
						/>
						{inn && pinAnalysis.errorMessage && (
							<p className="mt-1 text-[11px] font-bold text-red-600">
								{pinAnalysis.errorMessage}
							</p>
						)}
					</div>

					<div>
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Серийный номер бланка
						</label>
						<div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#283375] focus-within:ring-2 focus-within:ring-[#283375]/10 transition-all bg-white">
							<span
								className="px-3.5 py-2.5 bg-slate-100 text-slate-700 font-mono font-bold text-xs select-none border-r border-slate-200 flex-shrink-0"
								title="Префикс бланка строгой отчетности"
							>
								ЦС №
							</span>
							<input
								type="text"
								required
								value={certNumberDigits}
								onChange={(e) => {
									const val = e.target.value.replace(/^ЦС\s*№\s*/i, '').trim();
									onCertNumberDigitsChange(val);
								}}
								placeholder="000761"
								className="w-full px-3.5 py-2.5 outline-none font-mono font-bold text-slate-900 text-xs bg-transparent"
							/>
						</div>
					</div>

					<div>
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Дата выдачи сертификата
						</label>
						<input
							type="date"
							value={issuedDate}
							onChange={(e) => onIssuedDateChange(e.target.value)}
							className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-semibold text-slate-900"
						/>
					</div>

					<div className="sm:col-span-2">
						<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
							Квалификация / Профессия
						</label>
						<input
							type="text"
							required
							value={profession}
							onChange={(e) => onProfessionChange(e.target.value)}
							placeholder="Например: Мастер столярного и мебельного производства"
							className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-semibold text-slate-900"
						/>
					</div>

					{/* Контакты для обратной связи */}
					<div>
						<div className="flex items-center justify-between mb-1">
							<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
								Телефон для связи
							</label>
							<span className="text-[10px] font-semibold text-slate-400" title="Не отображается работодателям на публичной странице проверки QR">
								🔒 Только для ЦНСВ
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<input
								type="tel"
								value={phone}
								onChange={(e) => onPhoneChange(e.target.value)}
								placeholder="+996 700 000 000"
								className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-mono font-semibold text-slate-900"
							/>
							{phone.trim() && (
								<a
									href={`tel:${phone.replace(/[^\d+]/g, '')}`}
									className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex-shrink-0 transition-colors"
									title="Позвонить специалисту"
								>
									📞
								</a>
							)}
						</div>
					</div>

					<div>
						<div className="flex items-center justify-between mb-1">
							<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
								Номер WhatsApp
							</label>
							{phone.trim() && whatsapp !== phone && (
								<button
									type="button"
									onClick={() => onWhatsappChange(phone)}
									className="text-[10px] font-bold text-[#283375] hover:underline cursor-pointer"
								>
									Как телефон
								</button>
							)}
						</div>
						<div className="flex items-center gap-1.5">
							<input
								type="tel"
								value={whatsapp}
								onChange={(e) => onWhatsappChange(e.target.value)}
								placeholder="+996 700 000 000"
								className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-mono font-semibold text-slate-900"
							/>
							{(whatsapp.trim() || phone.trim()) && (
								<a
									href={`https://wa.me/${(whatsapp.trim() || phone.trim()).replace(/\D/g, '')}`}
									target="_blank"
									rel="noopener noreferrer"
									className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1 flex-shrink-0 transition-colors whitespace-nowrap"
									title="Написать специалисту в WhatsApp"
								>
									<span>💬</span>
									<span>WhatsApp</span>
								</a>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
