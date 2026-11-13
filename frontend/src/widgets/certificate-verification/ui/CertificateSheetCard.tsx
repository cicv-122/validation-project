import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
	CertifiedUser,
	AssessmentEvidenceDoc,
	AssessmentPhotoItem,
	NewsItem,
} from '../../../types';
import { translateProfession } from '../../../utils/translateProfession';
import { transliterate } from '../../../utils/transliterate';
import emblemKyrgyzstan from '../../../assets/logo/emblem-kyrgyzstan.svg';
import { CertificateMediaPreview } from './CertificateMediaModal';

interface CertificateSheetCardProps {
	user: CertifiedUser;
	activeInn?: string;
	onPreviewDoc: (preview: CertificateMediaPreview) => void;
}

export function CertificateSheetCard({
	user,
	activeInn,
	onPreviewDoc,
}: CertificateSheetCardProps) {
	const { t, i18n } = useTranslation();
	const [copied, setCopied] = useState(false);
	const [qrError, setQrError] = useState(false);

	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};

	const formatDate = (dateStr: string | null | undefined) => {
		if (!dateStr) return '—';
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString(
				i18n.language === 'en' ? 'en-US' : i18n.language === 'ky' ? 'ky-KG' : 'ru-RU',
				{ day: 'numeric', month: 'long', year: 'numeric' }
			);
		} catch {
			return dateStr;
		}
	};

	return (
		<div className='bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:m-0 scroll-mt-24'>
			{/* 1. ПАРАДНАЯ ГОСУДАРСТВЕННАЯ ШАПКА */}
			<div className='bg-gradient-to-r from-[#172052] via-[#283375] to-[#1c2557] text-white p-6 sm:p-8 border-b-4 border-amber-400'>
				<div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6'>
					<div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left'>
						<img
							src={emblemKyrgyzstan}
							alt='Герб Кыргызской Республики'
							className='w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0 drop-shadow-md'
						/>
						<div>
							<div className='text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-amber-300'>
								{i18n.language === 'ky'
									? 'Кыргыз Республикасынын Агартуу министрлиги'
									: i18n.language === 'en'
									? 'Ministry of Education of the Kyrgyz Republic'
									: 'Министерство просвещения Кыргызской Республики'}
							</div>
							<h1 className='text-lg sm:text-2xl font-black tracking-tight text-white mt-1 leading-snug'>
								{t('Центр независимой сертификации и валидации')}
							</h1>
							<div className='text-xs text-blue-100 font-medium mt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap'>
								<span className='inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
								<span>{t('Единый государственный реестр выданных сертификатов квалификации')}</span>
							</div>
						</div>
					</div>

					{/* Номер бланка строгой отчетности */}
					<div className='flex flex-col items-center sm:items-end justify-center bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl px-5 py-3 flex-shrink-0 shadow-inner'>
						<span className='text-[10px] uppercase font-bold text-amber-300 tracking-wider'>
							{t('Бланк строгой отчетности')}
						</span>
						<span className='text-lg sm:text-xl font-black font-mono tracking-wider text-white mt-0.5'>
							{user.registration_number}
						</span>
					</div>
				</div>
			</div>

			{/* 2. ЗЕЛЕНАЯ ЗАЩИТНАЯ ЛЕНТА ПОДЛИННОСТИ */}
			<div className='bg-[#0d8a55] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner'>
				<div className='flex items-center gap-2.5 font-bold text-sm sm:text-base'>
					<div className='w-6 h-6 rounded-full bg-white text-[#0d8a55] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs'>
						✓
					</div>
					<span>{t('ДОКУМЕНТ ПОДЛИННЫЙ И ДЕЙСТВИТЕЛЕН')}</span>
					<span className='hidden md:inline-block text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold ml-1'>
						{t('Зарегистрирован в реестре ЦНСВ МП КР')}
					</span>
				</div>

				<div className='flex items-center gap-2 text-xs'>
					<button
						type='button'
						onClick={handleCopyLink}
						className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-full font-bold transition-all cursor-pointer print:hidden'
					>
						<svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
						</svg>
						<span>{copied ? `✓ ${t('Скопировано')}` : t('Ссылка')}</span>
					</button>

					<button
						type='button'
						onClick={() => window.print()}
						className='inline-flex items-center gap-1.5 px-3.5 py-1 bg-white hover:bg-emerald-50 text-emerald-900 rounded-full font-bold shadow-xs transition-colors cursor-pointer print:hidden'
					>
						<svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
						</svg>
						<span>{t('Печать выписки')}</span>
					</button>
				</div>
			</div>

			{/* 3. ОСНОВНОЙ ПАСПОРТ КВАЛИФИКАЦИИ */}
			<div className='p-6 sm:p-8 space-y-8'>
				{/* Фото, ФИО и официальный QR-код */}
				<div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-slate-200 pb-8'>
					{/* Фотография 3×4 */}
					<div className='flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 text-center sm:text-left'>
						{user.image && (
							<div className='relative flex-shrink-0'>
								<img
									src={user.image}
									alt={user.full_name}
									className='w-28 h-36 sm:w-32 sm:h-40 rounded-2xl object-cover border-2 border-slate-300 shadow-md'
								/>
								<span className='absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md' title={t('Личность подтверждена в государственном реестре')}>
									<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
									</svg>
								</span>
							</div>
						)}

						{/* Имя и квалификация */}
						<div className='flex-1'>
							<span className='text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1'>
								{t('Владелец государственного сертификата')}
							</span>
							<h2 className='text-2xl sm:text-3xl font-black text-slate-900 leading-tight'>
								{i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
							</h2>
							{i18n.language === 'en' && (
								<span className='text-xs font-semibold text-slate-400 block mt-0.5'>
									{user.full_name}
								</span>
							)}

							<div className='inline-flex items-center gap-1.5 mt-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold'>
								<span>✓</span>
								<span>{t('Личность подтверждена в государственном реестре')}</span>
							</div>

							{/* Профессия / Квалификация */}
							<div className='mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-left'>
								<span className='text-[10px] font-extrabold uppercase tracking-wider text-[#283375] block'>
									{t('Присвоенная профессия и квалификация:')}
								</span>
								<div className='text-lg sm:text-xl font-black text-[#283375] mt-0.5 leading-snug'>
									{translateProfession(user.profession, i18n.language)}
								</div>

								{user.assessment_details?.qualification_level && (
									<div className='text-xs font-bold text-slate-700 mt-1 flex items-center gap-2'>
										<span className='px-2.5 py-0.5 rounded-md bg-white border border-blue-200 text-[#283375]'>
											{t(user.assessment_details.qualification_level)}
										</span>
										{user.assessment_details.specialization && (
											<span className='text-slate-600'>
												{t('Специализация:')} <b>{t(user.assessment_details.specialization)}</b>
											</span>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* QR-код бланка */}
					<div className='flex flex-col items-center justify-center p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl flex-shrink-0 shadow-xs self-center sm:self-auto'>
						<img
							src={!qrError && user.qr_code ? user.qr_code : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=2&data=${encodeURIComponent(window.location.href)}`}
							alt='QR-код документа'
							onError={() => setQrError(true)}
							className='w-28 h-28 object-contain rounded-lg bg-white p-1'
						/>
						<span className='text-[9px] text-slate-500 font-mono font-bold mt-1 uppercase tracking-wider text-center'>
							{t('QR-код документа')}
						</span>
					</div>
				</div>

				{/* 4. СЕТКА ОФИЦИАЛЬНЫХ РЕКВИЗИТОВ (3 КЛЮЧЕВЫХ ПАРАМЕТРА) */}
				<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-left'>
					<div>
						<span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1'>
							{t('Номер сертификата')}
						</span>
						<span className='text-base sm:text-lg font-mono font-bold text-slate-900'>
							{user.registration_number}
						</span>
					</div>

					<div>
						<span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1'>
							{t('ПИН / ИНН владельца')}
						</span>
						<div className='flex items-center gap-1.5 flex-wrap'>
							<span className='text-sm sm:text-base font-mono font-bold text-slate-900'>
								{user.inn || activeInn || t('Подтвержден')}
							</span>
							<span className='text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded'>
								✓ {t('Сверен')}
							</span>
						</div>
					</div>

					<div>
						<span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1'>
							{t('Дата выдачи')}
						</span>
						<span className='text-sm sm:text-base font-semibold text-slate-900'>
							{formatDate(user.issued_date)}
						</span>
					</div>
				</div>

				{/* 5. СВЕДЕНИЯ О КВАЛИФИКАЦИОННОМ ЭКЗАМЕНЕ И ДОКУМЕНТЫ ДЕЛА */}
				{user.assessment_details && (() => {
					const evalSheetDoc = user.assessment_details.evaluation_documents?.find(
						(d: AssessmentEvidenceDoc) => d.doc_type === 'evaluation_sheet'
					);
					const examTaskDoc = user.assessment_details.evaluation_documents?.find(
						(d: AssessmentEvidenceDoc) => d.doc_type === 'exam_task'
					);
					const examProtocolDoc = user.assessment_details.evaluation_documents?.find(
						(d: AssessmentEvidenceDoc) => d.doc_type === 'exam_protocol'
					);

					return (
						<div className='space-y-6'>
							{/* Сведения об экзамене */}
							<div className='p-5 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-4'>
								<div className='flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3'>
									<div className='flex items-center gap-2.5'>
										<div className='w-8 h-8 rounded-lg bg-[#283375] text-white flex items-center justify-center flex-shrink-0'>
											<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
											</svg>
										</div>
										<div>
											<h3 className='text-sm sm:text-base font-black text-slate-900'>
												{t('Сведения о квалификационном экзамене')}
											</h3>
											<p className='text-[11px] text-slate-500'>
												{t('Результаты подтверждения профессиональной компетентности')}
											</p>
										</div>
									</div>

									{user.assessment_details.application_type_display && (
										<span className='text-xs font-bold px-3 py-1 bg-blue-100 text-[#283375] rounded-full border border-blue-200'>
											{t(user.assessment_details.application_type_display)}
										</span>
									)}
								</div>

								{/* Место, Дата, Комиссия */}
								<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
									<div className='bg-white p-3.5 rounded-xl border border-slate-200'>
										<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>
											<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
											</svg>
											<span>{t('Место проведения оценки')}</span>
										</div>
										<div className='text-xs font-semibold text-slate-900 leading-snug'>
											{t(user.assessment_details.scheduled_location || 'Государственная аттестационная площадка ЦНСВ МП КР')}
										</div>
									</div>

									<div className='bg-white p-3.5 rounded-xl border border-slate-200'>
										<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>
											<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
											</svg>
											<span>{t('Дата проведения')}</span>
										</div>
										<div className='text-xs font-semibold text-slate-900'>
											{formatDate(user.assessment_details.scheduled_date || user.issued_date)}
										</div>
									</div>

									<div className='bg-white p-3.5 rounded-xl border border-slate-200'>
										<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>
											<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
											</svg>
											<span>{t('Экзаменационная комиссия')}</span>
										</div>
										<div className='text-xs font-semibold text-slate-900'>
											{t(user.assessment_details.assessor_name || 'Отраслевая квалификационная комиссия ЦНСВ при МП КР')}
										</div>
									</div>
								</div>

								{/* Решение комиссии */}
								<div className='p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2.5'>
									<span className='w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0'>
										✓
									</span>
									<span>
										<b>{t('Решение квалификационной комиссии:')}</b> {t('Теоретический и практический квалификационный экзамен сдан успешно. Навыки кандидата полностью соответствуют профессиональному стандарту.')}
									</span>
								</div>
							</div>

							{/* 6. ЭЛЕКТРОННОЕ ДЕЛО И ДОКУМЕНТЫ (В ОДНУ КОЛОНКУ) */}
							<div className='space-y-3 pt-1'>
								<div>
									<h4 className='text-xs font-extrabold uppercase tracking-wider text-slate-700'>
										{t('Электронное дело и подтверждающие документы')}
									</h4>
									<p className='text-[11px] text-slate-500'>
										{t('Официальные акты, экзаменационные материалы и материалы дела')}
									</p>
								</div>

								{/* Таблица-реестр в одну колонку */}
								<div className='divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs'>
									{/* 1. Оценочный лист */}
									<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
										<div className='flex items-center gap-3.5 min-w-0'>
											<div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
												evalSheetDoc ? 'bg-blue-50 text-[#283375] border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'
											}`}>
												<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
												</svg>
											</div>
											<div className='min-w-0'>
												<div className='text-xs font-bold text-slate-900'>
													{t('Оценочный лист квалификационного экзамена')}
												</div>
												<div className='text-[11px] text-slate-500 line-clamp-1'>
													{evalSheetDoc
														? (evalSheetDoc.description || t('Официальная ведомость баллов по теории, ТБ и практическим заданиям'))
														: t('Оригинал бумажного акта с подписями находится на хранении в Центральном госархиве ЦНСВ МП КР (г. Бишкек)')}
												</div>
											</div>
										</div>

										<div className='flex-shrink-0'>
											{evalSheetDoc ? (
												<button
													type='button'
													onClick={() => onPreviewDoc({
														url: evalSheetDoc.file_url,
														title: evalSheetDoc.doc_type_display || t('Оценочный лист квалификационного экзамена'),
														isPdf: /\.pdf$/i.test(evalSheetDoc.file_url),
													})}
													className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
												>
													<span>{t('Просмотреть скан')}</span>
													<span>↗</span>
												</button>
											) : (
												<span className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold'>
													<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8' />
													</svg>
													<span>{t('В архиве ЦНСВ')}</span>
												</span>
											)}
										</div>
									</div>

									{/* 2. Экзаменационный билет / задания */}
									<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
										<div className='flex items-center gap-3.5 min-w-0'>
											<div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
												examTaskDoc ? 'bg-blue-50 text-[#283375] border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'
											}`}>
												<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
												</svg>
											</div>
											<div className='min-w-0'>
												<div className='text-xs font-bold text-slate-900'>
													{t('Экзаменационный билет и практические задания')}
												</div>
												<div className='text-[11px] text-slate-500 line-clamp-1'>
													{examTaskDoc
														? (examTaskDoc.description || t('Экзаменационные тесты и технические задания с ответами кандидата'))
														: t('Экзаменационные материалы на хранении в Центральном государственном архиве ЦНСВ МП КР (г. Бишкек)')}
												</div>
											</div>
										</div>

										<div className='flex-shrink-0'>
											{examTaskDoc ? (
												<button
													type='button'
													onClick={() => onPreviewDoc({
														url: examTaskDoc.file_url,
														title: examTaskDoc.doc_type_display || t('Экзаменационный билет и практические задания'),
														isPdf: /\.pdf$/i.test(examTaskDoc.file_url),
													})}
													className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
												>
													<span>{t('Просмотреть задания')}</span>
													<span>↗</span>
												</button>
											) : (
												<span className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold'>
													<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8' />
													</svg>
													<span>{t('В архиве ЦНСВ')}</span>
												</span>
											)}
										</div>
									</div>

									{/* 3. Протокол комиссии */}
									<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
										<div className='flex items-center gap-3.5 min-w-0'>
											<div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
												examProtocolDoc ? 'bg-blue-50 text-[#283375] border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'
											}`}>
												<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
												</svg>
											</div>
											<div className='min-w-0'>
												<div className='text-xs font-bold text-slate-900'>
													{t('Протокол квалификационной комиссии')}
												</div>
												<div className='text-[11px] text-slate-500 line-clamp-1'>
													{examProtocolDoc
														? (examProtocolDoc.description || t('Итоговый протокол заседания комиссии с решением о подтверждении квалификации'))
														: t('Оригинал протокола заседания комиссии на хранении в Центральном госархиве ЦНСВ МП КР (г. Бишкек)')}
												</div>
											</div>
										</div>

										<div className='flex-shrink-0'>
											{examProtocolDoc ? (
												<button
													type='button'
													onClick={() => onPreviewDoc({
														url: examProtocolDoc.file_url,
														title: examProtocolDoc.doc_type_display || t('Протокол квалификационной комиссии'),
														isPdf: /\.pdf$/i.test(examProtocolDoc.file_url),
													})}
													className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
												>
													<span>{t('Просмотреть протокол')}</span>
													<span>↗</span>
												</button>
											) : (
												<span className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold'>
													<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8' />
													</svg>
													<span>{t('В архиве ЦНСВ')}</span>
												</span>
											)}
										</div>
									</div>

									{/* 4. Скан сертификата строгой отчетности */}
									{user.assessment_details.certificate_scan_url && (
										<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
											<div className='flex items-center gap-3.5 min-w-0'>
												<div className='w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center flex-shrink-0'>
													<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
													</svg>
												</div>
												<div className='min-w-0'>
													<div className='text-xs font-bold text-slate-900'>
														{t('Оригинал бумажного сертификата строгой отчетности')}
													</div>
													<div className='text-[11px] text-slate-500 line-clamp-1'>
														{t('Скан выданного государственного бланка с гербовой печатью и подписью руководства')}
													</div>
												</div>
											</div>

											<button
												type='button'
												onClick={() => onPreviewDoc({
													url: user.assessment_details!.certificate_scan_url!,
													title: `${t('Оригинал бумажного сертификата строгой отчетности')} ${user.registration_number}`,
													isPdf: /\.pdf$/i.test(user.assessment_details!.certificate_scan_url!),
												})}
												className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
											>
												<span>{t('Просмотреть оригинал сертификата')}</span>
												<span>↗</span>
											</button>
										</div>
									)}

									{/* 5. Фотофиксация квалификационного экзамена */}
									{user.assessment_details.exam_photos && user.assessment_details.exam_photos.length > 0 && (
										<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
											<div className='flex items-center gap-3.5 min-w-0'>
												<div className='w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0'>
													<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
													</svg>
												</div>
												<div className='min-w-0'>
													<div className='text-xs font-bold text-slate-900'>
														{t('Фотофиксация квалификационного экзамена')} ({user.assessment_details.exam_photos.length} {t('фото')})
													</div>
													<div className='text-[11px] text-slate-500 line-clamp-1'>
														{t('Снимки с места проведения: подтверждение выполнения практических заданий')}
													</div>
												</div>
											</div>

											<div className='flex items-center gap-2.5 flex-shrink-0'>
												<div className='flex items-center -space-x-2 mr-1'>
													{user.assessment_details.exam_photos.slice(0, 4).map((p: AssessmentPhotoItem, idx: number) => (
														<img
															key={idx}
															src={p.file_url}
															alt=''
															onClick={() => onPreviewDoc({
																url: p.file_url,
																title: `${t('Фотофиксация квалификационного экзамена')} (${idx + 1} / ${user.assessment_details!.exam_photos!.length})`,
																photos: user.assessment_details!.exam_photos!,
																currentIndex: idx,
															})}
															title={`${t('Открыть фото')} ${idx + 1}`}
															className='w-9 h-9 rounded-lg object-cover border-2 border-white shadow-2xs hover:scale-110 hover:z-10 transition-transform cursor-pointer'
														/>
													))}
												</div>
												<button
													type='button'
													onClick={() => onPreviewDoc({
														url: user.assessment_details!.exam_photos![0].file_url,
														title: `${t('Фотофиксация квалификационного экзамена')} (1 / ${user.assessment_details!.exam_photos!.length})`,
														photos: user.assessment_details!.exam_photos!,
														currentIndex: 0,
													})}
													className='w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
												>
													<span>{t('Смотреть фотографии')} ({user.assessment_details.exam_photos.length})</span>
													<span>↗</span>
												</button>
											</div>
										</div>
									)}

									{/* 6+. Личные документы кандидата */}
									{user.assessment_details.candidate_documents && user.assessment_details.candidate_documents.map((doc: AssessmentEvidenceDoc) => {
										const isImg = /\.(jpe?g|png|webp|gif)$/i.test(doc.file_url);
										const isPdf = /\.pdf$/i.test(doc.file_url);
										return (
											<div key={doc.id} className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
												<div className='flex items-center gap-3.5 min-w-0'>
													<div className='w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center flex-shrink-0'>
														<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
														</svg>
													</div>
													<div className='min-w-0'>
														<div className='text-xs font-bold text-slate-900'>
															{doc.doc_type_display}
														</div>
														<div className='text-[11px] text-slate-500 line-clamp-1'>
															{doc.description || t('Личный документ из дела кандидата')}
														</div>
													</div>
												</div>

												<button
													type='button'
													onClick={() => {
														if (isImg || isPdf) {
															onPreviewDoc({
																url: doc.file_url,
																title: doc.doc_type_display,
																isPdf,
															});
														} else {
															window.open(doc.file_url, '_blank');
														}
													}}
													className='w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#283375] text-slate-700 hover:text-white text-xs font-bold transition-all border border-slate-200 hover:border-transparent flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer'
												>
													<span>{t('Просмотреть документ')}</span>
													<span>↗</span>
												</button>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					);
				})()}

				{/* УПОМИНАНИЯ В НОВОСТЯХ И ПУБЛИКАЦИЯХ */}
				{user.news_articles && user.news_articles.length > 0 && (
					<div className='pt-2 border-t border-slate-200'>
						<h4 className='text-xs font-bold uppercase tracking-wider text-slate-500 mb-3'>
							{t('Публикации и события с участием специалиста')} ({user.news_articles.length})
						</h4>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
							{user.news_articles.map((item: NewsItem) => (
								<Link
									key={item.id}
									to={`/news/${item.slug || item.id}`}
									className='flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs text-slate-800 font-medium'
								>
									{item.image && (
										<img
											src={item.image}
											alt=''
											className='w-12 h-12 rounded-lg object-cover flex-shrink-0'
										/>
									)}
									<span className='line-clamp-2'>{item.title}</span>
								</Link>
							))}
						</div>
					</div>
				)}

				{/* ОФИЦИАЛЬНЫЙ ПОДВАЛ-ЗАВЕРЕНИЕ */}
				<div className='pt-6 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600 bg-slate-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6'>
					<div className='flex items-center gap-3'>
						<img
							src={emblemKyrgyzstan}
							alt=''
							className='w-9 h-9 object-contain opacity-80 flex-shrink-0'
						/>
						<div>
							<div className='font-bold text-slate-800'>
								{t('Центр независимой сертификации и валидации при Министерстве просвещения КР')}
							</div>
							<div className='text-[11px] text-slate-500'>
								{t('г. Бишкек, ул. Жусупа Абдрахманова, 276 (бывш. ул. Байтик баатыра, 122)')} • Тел: +996 312 59 14 01
							</div>
						</div>
					</div>

					<div className='text-right text-[11px] font-mono text-slate-500 sm:self-center'>
						<span>{t('ID в реестре:')} <b>{user.id}</b></span>
						<span className='block text-[10px] text-slate-400'>{t('Юридическая сила подтверждена')}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
